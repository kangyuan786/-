function renderOrderList(){

    const orderList =
    document.getElementById("orderList");

    const totalElement =
    document.querySelector(".total");

    if(!orderList || !totalElement) return;

    if(orderItems.length === 0){

        orderList.innerHTML =
        "尚未加入商品";

        totalElement.innerHTML =
        "合計：$0";

        return;

    }

    orderList.innerHTML = "";

    orderItems.forEach((item,index)=>{

        const row =
        document.createElement("div");

        row.className =
        "order-row";

        row.innerHTML = `
            <div
                onclick="editItem(${index})"
                style="flex:1;cursor:pointer;">
                <strong>${safeText(item.name)}</strong>
                ${item.remark ? `(${safeText(item.remark)})` : ""}
                　${getItemQtyText(item)}
                　$${item.amount}
            </div>

            <button onclick="removeItem(${index})">
                ✕
            </button>
        `;

        orderList.appendChild(row);

    });

    totalElement.innerHTML =
    `合計：$${getOrderTotal(orderItems)}`;

}

function removeItem(index){

    orderItems.splice(index,1);

    saveCurrentOrder();
    renderOrderList();

}

function editItem(index){

    const item =
    orderItems[index];

    currentProduct =
    item.name;

    editIndex =
    index;

    document.getElementById("modalTitle").innerText =
    item.name;

    document.getElementById("priceModeInput").value =
    item.priceMode || "fixed";

    document.getElementById("qtyInput").value =
    item.qty || "";

    document.getElementById("unitInput").value =
    item.unit || "包";

    document.getElementById("unitPriceInput").value =
    item.unitPrice || "";

    document.getElementById("amountInput").value =
    item.amount || "";

    document.getElementById("weightInput").value =
    item.weight || "";

    document.getElementById("remarkInput").value =
    item.remark || "";

    document.getElementById("productModal").classList.add("show");

}

function autoCalculateAmount(){

    const priceModeInput =
    document.getElementById("priceModeInput");

    if(!priceModeInput || priceModeInput.value !== "fixed"){
        return;
    }

    const qty =
    Number(document.getElementById("qtyInput").value);

    const unitPrice =
    Number(document.getElementById("unitPriceInput").value);

    if(!qty || !unitPrice){
        return;
    }

    document.getElementById("amountInput").value =
    Math.round(qty * unitPrice);

}

function saveModalItem(){

    const priceMode =
    document.getElementById("priceModeInput").value;

    const qty =
    document.getElementById("qtyInput").value;

    const unit =
    document.getElementById("unitInput").value;

    const unitPrice =
    document.getElementById("unitPriceInput").value;

    const weight =
    formatWeightInput(
        document.getElementById("weightInput").value
    );

    let amount =
    document.getElementById("amountInput").value;

    const remark =
    document.getElementById("remarkInput").value;

    if(priceMode === "fixed"){

        if(!qty || !unitPrice){
            alert("請輸入數量與單價");
            return;
        }

        if(!amount){
            amount =
            Math.round(Number(qty) * Number(unitPrice));
        }

    }

    if(priceMode === "weight"){

        if(!weight || !amount){
            alert("請輸入重量與金額");
            return;
        }

    }

    const itemData = {
        name:currentProduct,
        priceMode,
        qty,
        unit,
        unitPrice,
        weight,
        amount,
        remark
    };

    if(editIndex !== null){

        orderItems[editIndex] =
        itemData;

        editIndex = null;

    }else{

        orderItems.push(itemData);

    }

    saveRecentProduct(currentProduct);

    document.getElementById("productModal").classList.remove("show");

    saveCurrentOrder();
    renderOrderList();

}

function openCheckoutPreview(){

    if(orderItems.length === 0){
        alert("尚未加入商品");
        return;
    }

    if(!currentCustomer){
        alert("請先選擇客戶");
        return;
    }

    const shipDateInput =
    document.getElementById("shipDateInput");

    const today =
    new Date().toISOString().slice(0,10);

    if(shipDateInput && !shipDateInput.value){
        shipDateInput.value = today;
    }

    const shipDate =
    shipDateInput && shipDateInput.value
    ? shipDateInput.value
    : today;

    pendingOrder = {
        id:Date.now(),
        date:shipDate,
        customer:currentCustomer,
        items:[...orderItems],
        total:getOrderTotal(orderItems)
    };

    document.getElementById("receiptPreview").innerText =
    buildReceiptText(pendingOrder);

    document.getElementById("receiptModal").classList.add("show");

}

function updatePendingReceiptDate(){

    if(!pendingOrder) return;

    const shipDateInput =
    document.getElementById("shipDateInput");

    if(shipDateInput && shipDateInput.value){
        pendingOrder.date = shipDateInput.value;
    }

    document.getElementById("receiptPreview").innerText =
    buildReceiptText(pendingOrder);

}

async function confirmCheckout(){

    if(!pendingOrder) return;

    updatePendingReceiptDate();

    const savedOrder =
    await saveOrderToSupabase(pendingOrder);

    if(!savedOrder){
        alert("出貨失敗：訂單沒有存成功");
        return;
    }

    const itemsSaved =
    await saveOrderItemsToSupabase(
        savedOrder.id,
        pendingOrder.items
    );

    if(!itemsSaved){
        alert("出貨失敗：商品明細沒有存成功");
        return;
    }

    orderItems = [];
    pendingOrder = null;

    saveCurrentOrder();

    document.getElementById("receiptModal").classList.remove("show");

    renderOrderList();
    await initHistory();

    alert("出貨完成");

}
