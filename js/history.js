async function initHistory(){

    const cloudOrders =
    await loadOrdersFromSupabase();

    if(cloudOrders && cloudOrders.length > 0){

        historyOrders = cloudOrders;

    }else{

        historyOrders =
        JSON.parse(localStorage.getItem("historyOrders")) || [];

    }

    renderHistory();
    renderAllStats();

}

function getFilteredHistoryOrders(){

    let orders =
    [...historyOrders];

    const now =
    new Date();

    if(historyFilter === "today"){

        orders =
        orders.filter(order=>isSameDay(order.date,now));

    }

    if(historyFilter === "week"){

        orders =
        orders.filter(order=>{

            const date =
            new Date(order.date);

            const diff =
            (now - date) / (1000*60*60*24);

            return diff <= 7;

        });

    }

    if(historyFilter === "month"){

        orders =
        orders.filter(order=>isSameMonth(order.date,now));

    }

    const historySearch =
    document.getElementById("historySearch");

    const keyword =
    historySearch
    ? historySearch.value.trim().toLowerCase()
    : "";

    if(keyword){

        orders =
        orders.filter(order=>{

            const text =
            [
                order.customer,
                order.date,
                order.total,
                ...order.items.map(item=>item.name),
                ...order.items.map(item=>item.remark || ""),
                ...order.items.map(item=>item.weight || ""),
                ...order.items.map(item=>item.qty || "")
            ]
            .join(" ")
            .toLowerCase();

            return text.includes(keyword);

        });

    }

    return orders.reverse();

}

function renderHistory(){

    const historyList =
    document.getElementById("historyList");

    if(!historyList) return;

    historyList.innerHTML = "";

    const orders =
    getFilteredHistoryOrders();

    if(orders.length === 0){

        historyList.innerHTML =
        "尚無歷史紀錄";

        return;

    }

    orders.forEach(order=>{

        const card =
        document.createElement("div");

        card.className =
        "history-card";

        const itemCount =
        order.items ? order.items.length : 0;

        card.innerHTML = `
            <div class="history-swipe-wrap">

                <div class="history-action-panel">
                    <button
                        class="history-action-btn view"
                        onclick="viewHistoryReceipt('${order.id}')">
                        查看
                    </button>

                    <button
                        class="history-action-btn edit"
                        onclick="editHistoryOrder('${order.id}')">
                        編輯
                    </button>

                    <button
                        class="history-action-btn repeat"
                        onclick="repeatHistoryOrder('${order.id}')">
                        再次出貨
                    </button>

                    <button
                        class="history-action-btn delete"
                        onclick="deleteHistoryOrder('${order.id}')">
                        刪除
                    </button>
                </div>

                <div class="history-main">
                    <div class="history-customer">
                        ${safeText(order.customer)}
                    </div>

                    <div class="history-meta">
                        <span>${formatReceiptDate(order.date)}</span>
                        <span>$${order.total}</span>
                    </div>

                    <div class="history-count">
                        ${itemCount} 項商品
                    </div>
                </div>

            </div>
        `;

        card.addEventListener("click",(event)=>{

            if(event.target.closest("button")){
                return;
            }

            const swipeWrap =
            card.querySelector(".history-swipe-wrap");

            if(swipeWrap){
                swipeWrap.classList.toggle("swipe-delete");
            }

        });

        bindHistorySwipe(card);

        historyList.appendChild(card);

    });

}

function bindHistorySwipe(card){

    let touchStartX = 0;

    card.addEventListener("touchstart",(event)=>{

        touchStartX =
        event.changedTouches[0].screenX;

    });

    card.addEventListener("touchend",(event)=>{

        const touchEndX =
        event.changedTouches[0].screenX;

        const swipeWrap =
        card.querySelector(".history-swipe-wrap");

        if(!swipeWrap) return;

        if(touchStartX - touchEndX > 55){
            swipeWrap.classList.add("swipe-delete");
        }

        if(touchEndX - touchStartX > 55){
            swipeWrap.classList.remove("swipe-delete");
        }

    });

}

function repeatHistoryOrder(id){

    const order =
    historyOrders.find(item=>String(item.id) === String(id));

    if(!order){
        alert("找不到這筆出貨紀錄");
        return;
    }

    const confirmRepeat =
    confirm(`要把「${order.customer}」這筆紀錄帶入今日出貨嗎？`);

    if(!confirmRepeat) return;

    currentCustomer =
    order.customer;

    localStorage.setItem(
        "currentCustomer",
        currentCustomer
    );

    orderItems =
    JSON.parse(JSON.stringify(order.items || []));

    saveCurrentOrder();

    renderCustomerSelect();
    updateCurrentCustomerBox();
    renderOrderList();

    document.querySelectorAll(".tab").forEach(tab=>{
        tab.classList.remove("active");
    });

    document.querySelectorAll(".page").forEach(page=>{
        page.classList.remove("active-page");
    });

    document.querySelector('[data-page="deliveryPage"]').classList.add("active");
    document.getElementById("deliveryPage").classList.add("active-page");

    alert("已帶入今日出貨，可直接修改後重新出貨");

}

function editHistoryOrder(id){

    repeatHistoryOrder(id);

}

async function deleteHistoryOrder(id){

    const confirmDelete =
    confirm("確定要刪除這筆歷史紀錄嗎？");

    if(!confirmDelete) return;

    const success =
    await deleteOrderFromSupabase(id);

    if(!success){
        alert("刪除失敗");
        return;
    }

    await initHistory();

    alert("歷史紀錄已刪除");

}
