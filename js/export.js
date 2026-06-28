function exportOrders(filter){

    let orders =
    [...historyOrders];

    const now =
    new Date();

    if(filter === "today"){
        orders = orders.filter(order=>isSameDay(order.date,now));
    }

    if(filter === "month"){
        orders = orders.filter(order=>isSameMonth(order.date,now));
    }

    if(orders.length === 0){
        alert("沒有資料可匯出");
        return;
    }

    let csv = "\uFEFF";

    csv +=
    "日期,客戶,商品,數量/重量,備註,金額\n";

    orders.forEach(order=>{

        order.items.forEach(item=>{

            csv += [
                new Date(order.date).toLocaleString("zh-TW"),
                order.customer,
                item.name,
                getItemQtyText(item),
                item.remark || "",
                item.amount
            ]
            .map(value=>`"${String(value).replace(/"/g,'""')}"`)
            .join(",");

            csv += "\n";

        });

    });

    const blob =
    new Blob(
        [csv],
        {
            type:"text/csv;charset=utf-8;"
        }
    );

    const url =
    URL.createObjectURL(blob);

    const link =
    document.createElement("a");

    link.href = url;

    const today =
    new Date()
    .toISOString()
    .slice(0,10);

    link.download =
    `蔬果出貨紀錄_${filter}_${today}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}
