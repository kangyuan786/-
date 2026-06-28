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

        const detailHtml =
        order.items.map(item=>{

            return `
                <div>
                    ${safeText(item.name)}
                    ${item.remark ? `(${safeText(item.remark)})` : ""}
                    ${getItemQtyText(item)}
                    $${item.amount}
                </div>
            `;

        }).join("");

        card.innerHTML = `
            <div><strong>${safeText(order.customer)}</strong></div>

            <div>
                ${new Date(order.date).toLocaleString("zh-TW")}
            </div>

            <div>
                合計 $${order.total}
            </div>

            <div class="history-swipe-wrap">

                <button
                    class="history-swipe-delete"
                    onclick="deleteHistoryOrder('${order.id}')">
                    刪除
                </button>

                <div class="history-main">

                    <div class="history-actions">
                        <button onclick="viewHistoryReceipt('${order.id}')">
                            👁️ 查看
                        </button>

                        <button onclick="copyHistoryReceipt('${order.id}')">
                            📋 重印
                        </button>
                    </div>

                    <div class="history-detail">
                        ${detailHtml}
                    </div>

                </div>

            </div>
        `;

        card.addEventListener("click",(event)=>{

            if(event.target.closest("button")){
                return;
            }

            const detail =
            card.querySelector(".history-detail");

            if(detail){
                detail.classList.toggle("show");
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

        if(touchStartX - touchEndX > 60){
            swipeWrap.classList.add("swipe-delete");
        }

        if(touchEndX - touchStartX > 60){
            swipeWrap.classList.remove("swipe-delete");
        }

    });

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
