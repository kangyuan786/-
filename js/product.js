async function initProducts(){

    const cloudProducts =
    await loadProductsFromSupabase();

    if(cloudProducts && cloudProducts.length > 0){

        productStore = {};

        cloudProducts.forEach(item=>{

            if(!productStore[item.category]){
                productStore[item.category] = [];
            }

            productStore[item.category].push(item.name);

        });

    }else{

        productStore =
        JSON.parse(localStorage.getItem("productStore")) || PRODUCTS;

    }

    renderProducts();
    renderManageProductList();

}

function renderProducts(category = "all"){

    const productGrid =
    document.getElementById("productGrid");

    if(!productGrid) return;

    productGrid.innerHTML = "";

    let products = [];

    if(category === "all"){

        Object.values(productStore).forEach(group=>{
            products = products.concat(group);
        });

    }else{

        products = productStore[category] || [];

    }

    products.forEach(name=>{

        const button =
        document.createElement("button");

        button.innerText = name;

        button.addEventListener("click",()=>{
            addProduct(name);
        });

        productGrid.appendChild(button);

    });

}

function renderRecentProducts(){

    const recentProductGrid =
    document.getElementById("recentProductGrid");

    if(!recentProductGrid) return;

    recentProductGrid.innerHTML = "";

    if(recentProducts.length === 0){

        recentProductGrid.innerHTML =
        `<div class="empty-text">尚無最近使用商品</div>`;

        return;

    }

    recentProducts.forEach(name=>{

        const button =
        document.createElement("button");

        button.innerText = name;

        button.addEventListener("click",()=>{
            addProduct(name);
        });

        recentProductGrid.appendChild(button);

    });

}

function renderManageProductList(){

    const list =
    document.getElementById("manageProductList");

    if(!list) return;

    list.innerHTML = "";

    Object.entries(productStore)
    .forEach(([category,products])=>{

        products.forEach(name=>{

            const row =
            document.createElement("div");

            row.className =
            "manage-product-row";

            row.innerHTML = `
                <span>${safeText(name)}</span>

                <div>
                    <button
                        class="preset-inline-btn"
                        onclick="setProductDefault('${safeText(name)}')">
                        設定
                    </button>

                    <button
                        class="edit-inline-btn"
                        onclick="renameProduct('${safeText(category)}','${safeText(name)}')">
                        編輯
                    </button>

                    <button
                        class="delete-inline-btn"
                        onclick="deleteProduct('${safeText(category)}','${safeText(name)}')">
                        ×
                    </button>
                </div>
            `;

            list.appendChild(row);

        });

    });

}

function addProduct(productName){

    currentProduct = productName;
    editIndex = null;

    const defaults =
    productDefaults[productName] || {};

    document.getElementById("modalTitle").innerText = productName;

    document.getElementById("priceModeInput").value =
    defaults.priceMode || "fixed";

    document.getElementById("qtyInput").value = "";

    document.getElementById("unitInput").value =
    defaults.unit || "包";

    document.getElementById("unitPriceInput").value =
    defaults.unitPrice || "";

    document.getElementById("amountInput").value = "";
    document.getElementById("weightInput").value = "";
    document.getElementById("remarkInput").value = "";

    document.getElementById("productModal").classList.add("show");

}

function saveRecentProduct(productName){

    recentProducts =
    recentProducts.filter(name=>name !== productName);

    recentProducts.unshift(productName);

    recentProducts =
    recentProducts.slice(0,8);

    localStorage.setItem(
        "recentProducts",
        JSON.stringify(recentProducts)
    );

    renderRecentProducts();

}

function saveProductDefaults(){
    localStorage.setItem(
        "productDefaults",
        JSON.stringify(productDefaults)
    );
}

function setProductDefault(name){

    const current =
    productDefaults[name] || {};

    const mode =
    prompt(
        "預設計價模式：fixed=固定單價，weight=秤重計價",
        current.priceMode || "fixed"
    );

    if(!mode) return;

    const finalMode =
    mode.trim() === "weight" ? "weight" : "fixed";

    const unit =
    prompt(
        "預設單位，例如：包、顆、斤、把",
        current.unit || "包"
    );

    if(!unit) return;

    const unitPrice =
    prompt(
        "預設單價，可空白",
        current.unitPrice || ""
    );

    productDefaults[name] = {
        priceMode:finalMode,
        unit:unit.trim(),
        unitPrice:unitPrice ? unitPrice.trim() : ""
    };

    saveProductDefaults();

    alert("商品預設資料已儲存");

}

async function quickAddProductFromSearch(name){

    const trimmedName =
    name.trim();

    if(!trimmedName) return;

    const allProducts =
    Object.values(productStore).flat();

    if(allProducts.includes(trimmedName)){
        alert("已存在此商品");
        return;
    }

    const activeBtn =
    document.querySelector(".category-btn.active");

    let category =
    activeBtn ? activeBtn.dataset.category : "vegetables";

    if(category === "all"){
        category = "vegetables";
    }

    const success =
    await addProductToSupabase(trimmedName,category);

    if(!success){
        alert("新增失敗");
        return;
    }

    await initProducts();

    document.getElementById("productSearch").value = "";

    alert("商品新增成功");

    addProduct(trimmedName);

}

async function renameProduct(category,name){

    const newName =
    prompt("請輸入新的商品名稱", name);

    if(!newName) return;

    const trimmedName =
    newName.trim();

    if(!trimmedName) return;

    if(productStore[category] && productStore[category].includes(trimmedName)){
        alert("這個商品名稱已經存在");
        return;
    }

    const success =
    await updateProductInSupabase(category,name,trimmedName);

    if(!success){
        alert("修改失敗");
        return;
    }

    if(productDefaults[name]){
        productDefaults[trimmedName] = productDefaults[name];
        delete productDefaults[name];
        saveProductDefaults();
    }

    recentProducts =
    recentProducts.map(item=>
        item === name ? trimmedName : item
    );

    orderItems =
    orderItems.map(item=>{

        if(item.name === name){
            return {
                ...item,
                name: trimmedName
            };
        }

        return item;

    });

    localStorage.setItem(
        "recentProducts",
        JSON.stringify(recentProducts)
    );

    saveCurrentOrder();

    await initProducts();

    renderRecentProducts();
    renderOrderList();

    alert("商品名稱修改成功");

}

async function deleteProduct(category,name){

    const confirmDelete =
    confirm(`確定刪除 ${name} 嗎？`);

    if(!confirmDelete) return;

    const success =
    await deleteProductFromSupabase(category,name);

    if(!success){
        alert("刪除失敗");
        return;
    }

    recentProducts =
    recentProducts.filter(item=>item !== name);

    delete productDefaults[name];
    saveProductDefaults();

    localStorage.setItem(
        "recentProducts",
        JSON.stringify(recentProducts)
    );

    await initProducts();

    renderRecentProducts();

    alert("商品刪除成功");

}
