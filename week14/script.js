const form = document.getElementById("todo_form")
const input = document.getElementById("todo_input")
const list = document.getElementById("todo_list")
let todo_list = []

function createLi(text){
    let li = document.createElement("li")

    let text_span = document.createElement("span")
    text_span.className = "todo_text"
    text_span.textContent = text

    let btn_del = document.createElement("button")
    btn_del.textContent = "×"
    btn_del.addEventListener("click", () => {
        todo_list.splice(todo_list.indexOf(text), 1)
        updateStorage()
        showTodo()
    })

    li.appendChild(text_span)
    li.appendChild(btn_del)
    return li
}

function showTodo(){
    list.innerHTML = ""
    if(todo_list.length == 0){
        let li = document.createElement("li")
        li.className = "no_task"
        li.textContent = "No tasks yet."
        list.appendChild(li)
        return
    }
    todo_list.forEach((text) => {
        list.appendChild(createLi(text))
    })
}

function updateStorage(){
    let arr_to_text = JSON.stringify(todo_list)
    localStorage.setItem("todo_list", arr_to_text)
}

form.addEventListener("submit", (e) => {
    e.preventDefault()
    if(input.value.trim() == "") return
    todo_list.push(input.value.trim())
    updateStorage()
    showTodo()
    input.value = ""
})

window.onload = () => {
    let data = localStorage.getItem("todo_list")
    if(data != null){
        todo_list = JSON.parse(data)
    }
    showTodo()
}
