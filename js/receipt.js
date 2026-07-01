function formatReceiptDate(dateValue){

    if(!dateValue) return "";

    const date =
    new Date(dateValue);

    if(isNaN(date.getTime())){
        return String(dateValue).replaceAll("-","/");
    }

    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;

}

function getReceiptColumns(item){

    let qtyText = "";
    let unitText = "";
    let noteText = "";

    if(item.priceMode === "weight"){

        if(item.qty){
            qtyText = String(item.qty);
            unitText = item.unit || "";
        }else{
            qtyText = "";
            unitText = "";
        }

        noteText = item.weight || "";

    }else{

        qtyText = item.qty || "";
        unitText = item.unit || "";
        noteText = item.weight || "";

    }

    const nameText =
    item.remark
    ? `${item.name}（${item.remark}）`
    : item.name;

    return {
        name:nameText,
        qty:qtyText,
        unit:unitText,
        unitPrice:item.unitPrice || "",
        amount:item.amount || "",
        note:noteText
    };

}

function buildReceiptHtml(order){

    const rows =
    order.items.map(item=>{

        const row =
        getReceiptColumns(item);

        return `
            <tr>
                <td class="receipt-name">${safeText(row.name)}</td>
                <td class="receipt-num">${safeText(row.qty)}</td>
                <td class="receipt-unit">${safeText(row.unit)}</td>
                <td class="receipt-price">${safeText(row.unitPrice)}</td>
                <td class="receipt-money">$${safeText(row.amount)}</td>
                <td class="receipt-note">${safeText(row.note)}</td>
            </tr>
        `;

    }).join("");

    return `
        <div class="receipt-paper">

            <div class="receipt-title">
                【康源蔬果行】
            </div>

            <div class="receipt-customer">
                ${safeText(order.customer)}
            </div>

            <div class="receipt-date">
                ${formatReceiptDate(order.date)}
            </div>

            <div class="receipt-dash"></div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th class="receipt-name">品名</th>
                        <th class="receipt-num">數量</th>
                        <th class="receipt-unit">單位</th>
                        <th class="receipt-price">單價</th>
                        <th class="receipt-money">金額</th>
                        <th class="receipt-note">備註</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="receipt-dash"></div>

            <div class="receipt-total">
                合計：$${order.total}
            </div>

        </div>
    `;

}

function buildReceiptLine(row){

    return (
        padDisplay(row.name,12) +
        padDisplay(row.qty,6,true) +
        " " +
        padDisplay(row.unit,4,true) +
        " " +
        padDisplay(row.unitPrice,6,true) +
        " " +
        padDisplay(`$${row.amount}`,7,true) +
        " " +
        padDisplay(row.note || "",10)
    );

}

function buildReceiptText(order){

    const line =
    "------------------------------------------------";

    let text = "";

    text += "【康源蔬果行】\n\n";
    text += `${order.customer}\n`;
    text += `${formatReceiptDate(order.date)}\n`;
    text += `${line}\n`;

    text += buildReceiptLine({
        name:"品名",
        qty:"數量",
        unit:"單位",
        unitPrice:"單價",
        amount:"金額",
        note:"備註"
    });

    text += "\n";
    text += `${line}\n`;

    order.items.forEach(item=>{

        const row =
        getReceiptColumns(item);

        text +=
        buildReceiptLine(row) + "\n";

    });

    text += `${line}\n`;
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

    const preview =
    document.getElementById("receiptPreview");

    if(preview){
        preview.innerHTML =
        buildReceiptHtml(order);

        document
        .getElementById("receiptModal")
        .classList
        .add("show");
    }else{
        alert(buildReceiptText(order));
    }

}


function openReceiptFullscreen(){

    const modal =
    document.getElementById("receiptModal");

    if(!modal){
        alert("目前沒有可顯示的出貨單");
        return;
    }

    modal.classList.add("receipt-fullscreen");
    document.body.classList.add("receipt-lock");

    const btn =
    document.getElementById("downloadReceiptImageBtn");

    if(btn){
        btn.innerText = "退出全螢幕";
        btn.onclick = closeReceiptFullscreen;
    }

}

function closeReceiptFullscreen(){

    const modal =
    document.getElementById("receiptModal");

    if(modal){
        modal.classList.remove("receipt-fullscreen");
    }

    document.body.classList.remove("receipt-lock");

    const btn =
    document.getElementById("downloadReceiptImageBtn");

    if(btn){
        btn.innerText = "全螢幕出貨單";
        btn.onclick = openReceiptFullscreen;
    }

}

async function downloadReceiptImage(){

    openReceiptFullscreen();

}



