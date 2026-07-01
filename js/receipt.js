function formatReceiptDate(dateValue){

    if(!dateValue) return "";

    const date =
    new Date(dateValue);

    if(isNaN(date.getTime())){
        return dateValue.replaceAll("-","/");
    }

    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;

}

function getReceiptColumns(item){

    let qtyText = "";
    let unitText = "";

    if(item.priceMode === "weight"){

        qtyText = item.weight || "";

        if(item.qty){
            qtyText += `（${item.qty}${item.unit || ""}）`;
        }

        unitText = item.unit || "";

    }else{

        qtyText = item.qty || "";
        unitText = item.unit || "";

    }

    return {
        name:item.remark ? `${item.name}(${item.remark})` : item.name,
        qty:qtyText,
        unit:unitText,
        unitPrice:item.unitPrice || "",
        amount:item.amount || ""
    };

}

function buildReceiptText(order){

    let text = "";

    text += "【康源蔬果行】\n\n";
    text += `${order.customer}\n`;
    text += `${formatReceiptDate(order.date)}\n`;
    text += "------------------------------\n";
    text += "品名        數量    單位  單價  金額\n";
    text += "------------------------------\n";

    order.items.forEach(item=>{

        const row =
        getReceiptColumns(item);

        text +=
        `${row.name}  ${row.qty}  ${row.unit}  ${row.unitPrice}  $${row.amount}\n`;

    });

    text += "------------------------------\n";
    text += `合計：$${order.total}`;

    return text;

}

async function copyText(text,message = "已複製"){

    await navigator.clipboard.writeText(text);

    alert(message);

}

async function copyHistoryReceipt(id){

    const order =
    historyOrders.find(item=>String(item.id) === String(id));

    if(!order){
        alert("找不到出貨單");
        return;
    }

    await copyText(
        buildReceiptText(order),
        "出貨單已複製\n可直接貼到 Fun Print"
    );

}

function viewHistoryReceipt(id){

    const order =
    historyOrders.find(item=>String(item.id) === String(id));

    if(!order){
        alert("找不到出貨單");
        return;
    }

    alert(
        buildReceiptText(order)
    );

}
