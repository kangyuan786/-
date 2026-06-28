function renderAllStats(){

    renderTodayStats();
    renderMonthStats();
    renderMonthReport();
    renderCustomerRanking();
    renderProductRanking();
    renderMonthCustomerRanking();
    renderMonthProductRanking();

}

function renderTodayStats(){

    const todayStats =
    document.getElementById("todayStats");

    if(!todayStats) return;

    const orders =
    historyOrders.filter(order=>isSameDay(order.date));

    const count =
    orders.length;

    const total =
    orders.reduce((sum,order)=>sum + Number(order.total || 0),0);

    todayStats.innerHTML =
    `出貨筆數：${count}<br>今日營收：$${total}`;

}

function renderMonthStats(){

    const monthStats =
    document.getElementById("monthStats");

    if(!monthStats) return;

    const total =
    historyOrders
    .filter(order=>isSameMonth(order.date))
    .reduce((sum,order)=>sum + Number(order.total || 0),0);

    monthStats.innerHTML =
    `本月營收：$${total}`;

}

function renderMonthReport(){

    const monthReport =
    document.getElementById("monthReport");

    if(!monthReport) return;

    const orders =
    historyOrders.filter(order=>isSameMonth(order.date));

    const revenue =
    orders.reduce((sum,order)=>sum + Number(order.total || 0),0);

    const customers =
    new Set(orders.map(order=>order.customer));

    const avgOrder =
    orders.length > 0
    ? Math.round(revenue / orders.length)
    : 0;

    monthReport.innerHTML = `
        <div>💰 本月營收：$${revenue}</div>
        <div>📦 本月出貨：${orders.length}筆</div>
        <div>👤 本月客戶：${customers.size}家</div>
        <div>🧾 平均客單價：$${avgOrder}</div>
    `;

}

function renderRanking(containerId, entries, emptyText = "尚無資料"){

    const container =
    document.getElementById(containerId);

    if(!container) return;

    if(entries.length === 0){

        container.innerHTML =
        emptyText;

        return;

    }

    container.innerHTML = "";

    entries.forEach(([name,total],index)=>{

        let medal = "";

        if(index === 0) medal = "🥇";
        else if(index === 1) medal = "🥈";
        else if(index === 2) medal = "🥉";

        const row =
        document.createElement("div");

        row.className =
        "ranking-row";

        row.innerHTML = `
            <span>${medal} ${safeText(name)}</span>
            <span>$${total}</span>
        `;

        container.appendChild(row);

    });

}

function getCustomerRanking(orders){

    const totals = {};

    orders.forEach(order=>{

        if(!totals[order.customer]){
            totals[order.customer] = 0;
        }

        totals[order.customer] +=
        Number(order.total || 0);

    });

    return Object.entries(totals)
    .sort((a,b)=>b[1]-a[1]);

}

function getProductRanking(orders){

    const totals = {};

    orders.forEach(order=>{

        order.items.forEach(item=>{

            if(!totals[item.name]){
                totals[item.name] = 0;
            }

            totals[item.name] +=
            Number(item.amount || 0);

        });

    });

    return Object.entries(totals)
    .sort((a,b)=>b[1]-a[1]);

}

function renderCustomerRanking(){

    const orders =
    historyOrders.filter(order=>isSameDay(order.date));

    renderRanking(
        "customerRanking",
        getCustomerRanking(orders)
    );

}

function renderProductRanking(){

    const orders =
    historyOrders.filter(order=>isSameDay(order.date));

    renderRanking(
        "productRanking",
        getProductRanking(orders)
    );

}

function renderMonthCustomerRanking(){

    const orders =
    historyOrders.filter(order=>isSameMonth(order.date));

    renderRanking(
        "monthCustomerRanking",
        getCustomerRanking(orders)
    );

}

function renderMonthProductRanking(){

    const orders =
    historyOrders.filter(order=>isSameMonth(order.date));

    renderRanking(
        "monthProductRanking",
        getProductRanking(orders)
    );

}
