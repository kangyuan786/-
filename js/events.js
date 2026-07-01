function bindEvents(){

    const qtyInput =
    document.getElementById("qtyInput");

    const unitPriceInput =
    document.getElementById("unitPriceInput");

    const priceModeInput =
    document.getElementById("priceModeInput");

    if(qtyInput){
        qtyInput.addEventListener("input",autoCalculateAmount);
    }

    if(unitPriceInput){
        unitPriceInput.addEventListener("input",autoCalculateAmount);
    }

    if(priceModeInput){
        priceModeInput.addEventListener("change",autoCalculateAmount);
    }

    document.getElementById("cancelBtn")
    .addEventListener("click",()=>{

        document.getElementById("productModal")
        .classList.remove("show");

        editIndex = null;

    });

    document.getElementById("saveBtn")
    .addEventListener("click",saveModalItem);

    document.getElementById("customerSelect")
    .addEventListener("change",()=>{

        currentCustomer =
        document.getElementById("customerSelect").value;

        localStorage.setItem(
            "currentCustomer",
            currentCustomer
        );

        updateCurrentCustomerBox();

    });

    document.getElementById("addCustomerBtn")
    .addEventListener("click",addCustomerFromPrompt);

    document.getElementById("checkoutBtn")
    .addEventListener("click",openCheckoutPreview);

    document.getElementById("receiptCancelBtn")
    .addEventListener("click",()=>{

        document.getElementById("receiptModal")
        .classList.remove("show");

    });

    document.getElementById("copyReceiptBtn")
    .addEventListener("click",async()=>{

        if(!pendingOrder) return;

        await copyText(
            buildReceiptText(pendingOrder),
            "已複製出貨單，可以貼到 Fun Print"
        );

    });


    const shipDateInput =
    document.getElementById("shipDateInput");

    if(shipDateInput){
        shipDateInput.addEventListener("change",updatePendingReceiptDate);
    }

    document.getElementById("confirmCheckoutBtn")
    .addEventListener("click",confirmCheckout);

    bindProductSearch();
    bindCategoryButtons();
    bindManageButtons();
    bindExportButtons();
    bindHistoryFilters();

}

function bindProductSearch(){

    const productSearch =
    document.getElementById("productSearch");

    const productGrid =
    document.getElementById("productGrid");

    if(!productSearch || !productGrid) return;

    productSearch.addEventListener("input",()=>{

        const keyword =
        productSearch.value.trim();

        if(keyword === ""){

            const activeBtn =
            document.querySelector(".category-btn.active");

            renderProducts(
                activeBtn
                ? activeBtn.dataset.category
                : "all"
            );

            return;

        }

        productGrid.innerHTML = "";

        let allProducts = [];

        Object.values(productStore).forEach(group=>{
            allProducts = allProducts.concat(group);
        });

        const results =
        allProducts.filter(name=>
            name.toLowerCase().includes(keyword.toLowerCase())
        );

        if(results.length === 0){

            productGrid.innerHTML = `
                <div class="empty-text">找不到商品</div>
                <button
                    class="quick-add-product"
                    onclick="quickAddProductFromSearch('${keyword}')">
                    ＋ 新增「${keyword}」為商品
                </button>
            `;

            return;

        }

        results.forEach(name=>{

            const button =
            document.createElement("button");

            button.innerText = name;

            button.addEventListener("click",()=>{
                addProduct(name);
            });

            productGrid.appendChild(button);

        });

    });

}

function bindCategoryButtons(){

    document
    .querySelectorAll(".category-btn")
    .forEach(button=>{

        button.addEventListener("click",()=>{

            document
            .querySelectorAll(".category-btn")
            .forEach(btn=>{
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const productSearch =
            document.getElementById("productSearch");

            if(productSearch){
                productSearch.value = "";
            }

            renderProducts(button.dataset.category);

        });

    });

}

function bindManageButtons(){

    document.getElementById("addProductBtn")
    .addEventListener("click",async()=>{

        const name =
        document
        .getElementById("newProductName")
        .value
        .trim();

        const category =
        document
        .getElementById("newProductCategory")
        .value;

        if(!name){
            alert("請輸入商品名稱");
            return;
        }

        if(productExists(name)){
            alert("已存在此商品");
            return;
        }

        const success =
        await addProductToSupabase(name,category);

        if(!success){
            alert("新增失敗");
            return;
        }

        document
        .getElementById("newProductName")
        .value = "";

        await initProducts();

        alert("商品新增成功");

    });

    document.getElementById("addCustomerManageBtn")
    .addEventListener("click",async()=>{

        const name =
        document
        .getElementById("newCustomerName")
        .value
        .trim();

        if(!name){
            alert("請輸入客戶名稱");
            return;
        }

        await addCustomerByName(name);

        document
        .getElementById("newCustomerName")
        .value = "";

    });

}

function bindExportButtons(){

    document
    .getElementById("exportAllBtn")
    .addEventListener("click",()=>{
        exportOrders("all");
    });

    document
    .getElementById("exportTodayBtn")
    .addEventListener("click",()=>{
        exportOrders("today");
    });

    document
    .getElementById("exportMonthBtn")
    .addEventListener("click",()=>{
        exportOrders("month");
    });

}

function bindHistoryFilters(){

    document
    .querySelectorAll(".history-filter-btn")
    .forEach(btn=>{

        btn.addEventListener("click",()=>{

            document
            .querySelectorAll(".history-filter-btn")
            .forEach(item=>{
                item.classList.remove("active");
            });

            btn.classList.add("active");

            historyFilter =
            btn.dataset.filter;

            renderHistory();

        });

    });

    const historySearch =
    document.getElementById("historySearch");

    if(historySearch){

        historySearch.addEventListener("input",()=>{
            renderHistory();
        });

    }

}

function bindTabs(){

    const tabs =
    document.querySelectorAll(".tab");

    const pages =
    document.querySelectorAll(".page");

    tabs.forEach(tab=>{

        tab.addEventListener("click",()=>{

            tabs.forEach(btn=>{
                btn.classList.remove("active");
            });

            pages.forEach(page=>{
                page.classList.remove("active-page");
            });

            tab.classList.add("active");

            const targetPage =
            document.getElementById(
                tab.dataset.page
            );

            if(targetPage){
                targetPage.classList.add("active-page");
            }

        });

    });

}
