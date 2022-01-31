const fs = require("async-file");
const _ = require("lodash");

const getItemFromRow = (fields, header, headerString) => {
  return fields[_.indexOf(header, headerString)] || "";
};

const getProductUrlFromLineItem = (fields, header) => {
  try {
    const baseUrl = "https://www.foo.com";
    const category = getItemFromRow(fields, header, "Category");
    const subCategory = getItemFromRow(fields, header, "Sub-Category");
    const productId = getItemFromRow(fields, header, "Product ID");
    return encodeURI([baseUrl, category, subCategory, productId].join("/"));
  } catch (e) {
    return "";
  }
};

const getPriceFromSales = (fields, header) => {
  try {
    return parseFloat(getItemFromRow(fields, header, "Sales"));
  } catch (e) {
    return NaN;
  }
};

const orderDateToISODate = (orderDate) => {
  try {
    return new Date(orderDate).toISOString();
  } catch (e) {
    return "";
  }
};

const getISOOrderDateIfAfter = (fields, header, dateString) => {
  try {
    const orderDate = getItemFromRow(fields, header, "Order Date");
    if (orderDate && new Date(orderDate) > new Date(dateString)) {
      return orderDateToISODate(orderDate);
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getLineItem = (fields, header) => {
  return {
    product_url: getProductUrlFromLineItem(fields, header),
    revenue: getPriceFromSales(fields, header),
  };
};

const getErrorFields = ({
  customerName,
  order_id,
  order_date,
  row,
  header,
}) => {
  let missingItems = [];
  const category = getItemFromRow(row, header, "Category");
  const subCategory = getItemFromRow(row, header, "Sub-Category");
  const productId = getItemFromRow(row, header, "Product ID");
  if (!customerName) {
    missingItems.push("Customer Name");
  }
  if (!order_id) {
    missingItems.push("Order ID");
  }
  if (!order_date) {
    missingItems.push("Order Date");
  }
  if (!category) {
    missingItems.push("Category");
  }
  if (!subCategory) {
    missingItems.push("Sub-Category");
  }
  if (!productId) {
    missingItems.push("Product ID");
  }
  return missingItems;
};

const convertToEntry = (row, header, line) => {
  const entry = {};
  const customerName = getItemFromRow(row, header, "Customer Name");
  const order_id = getItemFromRow(row, header, "Order ID");
  const order_date = getISOOrderDateIfAfter(row, header, "7/31/2016");
  const line_items = [getLineItem(row, header)];
  let errorFields = getErrorFields({
    customerName,
    order_id,
    order_date,
    row,
    header,
  });
  if (errorFields.length > 0) {
    return {
      ["error"]: {
        errors: [
          `line ${line}: Missed fields in the input: ${errorFields.toString()}`,
        ],
      },
    };
  }
  return {
    [customerName]: {
      orders: [{ order_id, order_date, line_items }],
    },
  };
};

// Used cloned object to avoid mutation of original data.
// const createOrMergeEntries = (item, data) => {
//   const key = Object.keys(item)[0];
//   const oldData = _.cloneDeep(data);
//   const entry = oldData[key];
//   if (entry) {
//     console.log(order);
//     for (let order of entry.orders) {
//       const check = item[key].orders[0];
//       if (order.order_id !== check.order_id) {
//         entry.orders.push(check);
//         break;
//       } else {
//         order.line_items.push(check.line_items[0]);
//       }
//     }
//   } else {
//     oldData[key] = item[key];
//   }
//   return oldData;
// };

const createOrMergeEntries = (header, item, data) => {
  const key = Object.keys(item)[0]; // will only ever be one here, as the key is the actual Customer Name string
  const entry = data[key];
  if (key == "error" && entry) {
    entry.errors.push(item[key].errors[0]);
  } else if (entry) {
    for (let order of entry.orders) {
      const check = item[key].orders[0];
      if (order.order_id !== check.order_id) {
        entry.orders.push(check);
        break;
      } else {
        order.line_items.push(check.line_items[0]);
      }
    }
  } else {
    data[key] = item[key];
  }
};

// const getOrderData = (lines, header) => {
//   let data = {};
//   data = _.tail(lines)
//     .map((row) => row.split("\t"))
//     .filter((row) => getISOOrderDateIfAfter(row, header, "7/31/2016"))
//     .map((row, index) => convertToEntry(row, header, index + 1))
//     .map((item) => createOrMergeEntries(item, data));
//   return data;
// };

const getOrderData = (lines, header) => {
  const data = {};
  const items = _.tail(lines)
    .map((row) => row.split("\t"))
    .filter((row) => getISOOrderDateIfAfter(row, header, "7/31/2016"))
    .map((row, index) => convertToEntry(row, header, index + 1))
    .map((item) => createOrMergeEntries(header, item, data));
  return data;
};

const parseAsString = async (content) => {
  try {
    const lines = content.split("\n");
    const header = lines[0].split("\t");
    const json = getOrderData(lines, header);
    return json;
  } catch (e) {
    console.error("Error parsing File: ", e.message);
  }
};

const parseAsFile = async (filename) => {
  try {
    const data = await fs.readFile(filename, { encoding: "utf-8" });
    const lines = data.split("\n");
    const header = lines[0].split("\t");
    const json = getOrderData(lines, header);
    return json;
  } catch (e) {
    console.error("Error Parsing File: ", e.message);
  }
};

module.exports = {
  parseAsFile,
  parseAsString,
  orderDateToISODate,
  getISOOrderDateIfAfter,
};
