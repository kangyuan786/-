async function initApp(){

    await initCustomers();
    await initProducts();
    await initHistory();

    renderRecentProducts();
    renderOrderList();

    bindEvents();
    bindTabs();

}

initApp();
