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

    document.getElementById("modalTitle").innerText = productName;

    document.getElementById("priceModeInput").value = "fixed";
    document.getElementById("qtyInput").value = "";
    document.getElementById("unitInput").value = "包";
    document.getElementById("unitPriceInput").value = "";
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

    localStorage.setItem(
        "recentProducts",
        JSON.stringify(recentProducts)
    );

    await initProducts();

    renderRecentProducts();

    alert("商品刪除成功");

}
