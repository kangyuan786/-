let recentProducts =
JSON.parse(localStorage.getItem("recentProducts")) || [];

let productStore = {};
let customerStore = [];

let productDefaults =
JSON.parse(localStorage.getItem("productDefaults")) || {};

let orderItems =
JSON.parse(localStorage.getItem("orderItems")) || [];

let currentCustomer =
localStorage.getItem("currentCustomer") || "";

let historyOrders =
JSON.parse(localStorage.getItem("historyOrders")) || [];

let currentProduct = "";
let editIndex = null;
let pendingOrder = null;
let historyFilter = "all";
