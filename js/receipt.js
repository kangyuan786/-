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
            <div class="receipt-grid-row">
                <div class="receipt-col receipt-name" title="${safeText(row.name)}">${safeText(row.name)}</div>
                <div class="receipt-col receipt-qty">${safeText(row.qty)}</div>
                <div class="receipt-col receipt-unit">${safeText(row.unit)}</div>
                <div class="receipt-col receipt-price">${safeText(row.unitPrice)}</div>
                <div class="receipt-col receipt-money">$${safeText(row.amount)}</div>
                <div class="receipt-col receipt-note">${safeText(row.note)}</div>
            </div>
        `;

    }).join("");

    return `
        <div class="receipt-paper">

            <div class="receipt-title">【康源蔬果行】</div>
            <div class="receipt-customer">${safeText(order.customer)}</div>
            <div class="receipt-date">${formatReceiptDate(order.date)}</div>

            <div class="receipt-dash"></div>

            <div class="receipt-grid receipt-grid-head">
                <div class="receipt-col receipt-name">品名</div>
                <div class="receipt-col receipt-qty">數量</div>
                <div class="receipt-col receipt-unit">單位</div>
                <div class="receipt-col receipt-price">單價</div>
                <div class="receipt-col receipt-money">金額</div>
                <div class="receipt-col receipt-note">備註</div>
            </div>

            <div class="receipt-dash receipt-dash-thin"></div>

            <div class="receipt-grid-body">
                ${rows}
            </div>

            <div class="receipt-dash"></div>

            <div class="receipt-total">合計：$${order.total}</div>

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

    const line = "------------------------------------------------";
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

        const row = getReceiptColumns(item);
        text += buildReceiptLine(row) + "\n";

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
        preview.innerHTML = buildReceiptHtml(order);

        document
        .getElementById("receiptModal")
        .classList
        .add("show");
    }else{
        alert(buildReceiptText(order));
    }

}

function removeReceiptImagePreview(){

    const oldPreview =
    document.getElementById("receiptImagePreviewWrap");

    if(oldPreview){
        oldPreview.remove();
    }

}

async function generateReceiptImagePreview(){

    const paper =
    document.querySelector(".receipt-paper");

    if(!paper){
        alert("目前沒有可產生的出貨單");
        return;
    }

    if(typeof html2canvas === "undefined"){
        alert("圖片工具尚未載入，請重新整理後再試一次");
        return;
    }

    removeReceiptImagePreview();

    const btn =
    document.getElementById("downloadReceiptImageBtn");

    const originalText =
    btn ? btn.innerText : "";

    if(btn){
        btn.innerText = "產生中...";
        btn.disabled = true;
    }

    try{

        const canvas =
        await html2canvas(
            paper,
            {
                backgroundColor:"#fffdf7",
                scale:2,
                useCORS:true,
                scrollX:0,
                scrollY:0,
                windowWidth:paper.scrollWidth,
                windowHeight:paper.scrollHeight
            }
        );

        const imageUrl =
        canvas.toDataURL("image/png");

        const wrap =
        document.createElement("div");

        wrap.id = "receiptImagePreviewWrap";
        wrap.className = "receipt-image-preview-wrap";

        wrap.innerHTML = `
            <div class="receipt-image-tip">
                已產生完整長圖。手機可長按圖片儲存，或截圖後傳給客戶。
            </div>

            <img
                class="receipt-image-preview"
                src="${imageUrl}"
                alt="康源蔬果行出貨單"
            >
        `;

        const receiptPreview =
        document.getElementById("receiptPreview");

        if(receiptPreview){
            receiptPreview.after(wrap);
        }

        if(btn){
            btn.innerText = "重新產生長圖";
        }

    }catch(error){

        console.error("產生長圖失敗", error);
        alert("產生長圖失敗，請再試一次");

        if(btn){
            btn.innerText = originalText || "產生長圖";
        }

    }finally{

        if(btn){
            btn.disabled = false;
        }

    }

}

function closeReceiptFullscreen(){

    removeReceiptImagePreview();

    const btn =
    document.getElementById("downloadReceiptImageBtn");

    if(btn){
        btn.innerText = "產生長圖";
        btn.onclick = generateReceiptImagePreview;
    }

}

async function downloadReceiptImage(){

    await generateReceiptImagePreview();

}
