async function initCustomers(){

    const cloudCustomers =
    await loadCustomersFromSupabase();

    if(cloudCustomers && cloudCustomers.length > 0){

        customerStore =
        cloudCustomers.map(item=>item.name);

    }else{

        customerStore =
        JSON.parse(localStorage.getItem("customerStore")) || CUSTOMERS;

    }

    renderCustomerSelect();
    renderHotCustomers();
    renderManageCustomerList();
    updateCurrentCustomerBox();

}

function renderCustomerSelect(){

    const customerSelect =
    document.getElementById("customerSelect");

    if(!customerSelect) return;

    customerSelect.innerHTML = "";

    customerStore.forEach(customer=>{

        const option =
        document.createElement("option");

        option.value = customer;
        option.textContent = customer;

        customerSelect.appendChild(option);

    });

    if(currentCustomer && customerStore.includes(currentCustomer)){
        customerSelect.value = currentCustomer;
    }else{
        currentCustomer = customerStore[0] || "";
        localStorage.setItem("currentCustomer", currentCustomer);
    }

    updateCurrentCustomerBox();

}

function updateCurrentCustomerBox(){

    const currentCustomerBox =
    document.getElementById("currentCustomerBox");

    if(!currentCustomerBox) return;

    currentCustomerBox.innerText =
    currentCustomer
    ? `目前客戶：${currentCustomer}`
    : "目前客戶：尚未選擇";

}

function renderHotCustomers(){

    const hotCustomerGrid =
    document.getElementById("hotCustomerGrid");

    if(!hotCustomerGrid) return;

    hotCustomerGrid.innerHTML = "";

    HOT_CUSTOMERS.forEach(customer=>{

        const button =
        document.createElement("button");

        button.innerText = customer;

        button.addEventListener("click",()=>{

            currentCustomer = customer;

            const customerSelect =
            document.getElementById("customerSelect");

            if(customerSelect){
                customerSelect.value = customer;
            }

            localStorage.setItem("currentCustomer", currentCustomer);

            updateCurrentCustomerBox();

        });

        hotCustomerGrid.appendChild(button);

    });

}

function renderManageCustomerList(){

    const list =
    document.getElementById("manageCustomerList");

    if(!list) return;

    list.innerHTML = "";

    customerStore.forEach(name=>{

        const row =
        document.createElement("div");

        row.className =
        "manage-product-row";

        row.innerHTML = `
            <span>${safeText(name)}</span>

            <div>
                <button
                    class="edit-inline-btn"
                    onclick="renameCustomer('${safeText(name)}')">
                    編輯
                </button>

                <button
                    class="delete-inline-btn"
                    onclick="deleteCustomer('${safeText(name)}')">
                    ×
                </button>
            </div>
        `;

        list.appendChild(row);

    });

}

async function addCustomerFromPrompt(){

    const name =
    prompt("請輸入客戶名稱");

    if(!name) return;

    await addCustomerByName(name);

}

async function addCustomerByName(name){

    const trimmedName =
    name.trim();

    if(!trimmedName) return;

    if(customerStore.includes(trimmedName)){
        alert("客戶已存在");
        return;
    }

    const success =
    await addCustomerToSupabase(trimmedName);

    if(!success){
        alert("新增失敗");
        return;
    }

    currentCustomer = trimmedName;

    localStorage.setItem("currentCustomer", currentCustomer);

    await initCustomers();

    alert("客戶新增成功");

}

async function renameCustomer(name){

    const newName =
    prompt("請輸入新的客戶名稱", name);

    if(!newName) return;

    const trimmedName =
    newName.trim();

    if(!trimmedName) return;

    if(customerStore.includes(trimmedName)){
        alert("客戶名稱已存在");
        return;
    }

    const success =
    await updateCustomerInSupabase(name, trimmedName);

    if(!success){
        alert("修改失敗");
        return;
    }

    if(currentCustomer === name){
        currentCustomer = trimmedName;
        localStorage.setItem("currentCustomer", currentCustomer);
    }

    await initCustomers();

    alert("客戶名稱修改成功");

}

async function deleteCustomer(name){

    const confirmDelete =
    confirm(`確定刪除 ${name} 嗎？`);

    if(!confirmDelete) return;

    const success =
    await deleteCustomerFromSupabase(name);

    if(!success){
        alert("刪除失敗");
        return;
    }

    if(currentCustomer === name){
        currentCustomer = "";
        localStorage.setItem("currentCustomer", currentCustomer);
    }

    await initCustomers();

    alert("客戶刪除成功");

}
