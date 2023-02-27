console.log("Connected from ts file!!");

export function register() {
    // Your TypeScript function logic here
    console.log("Button clicked!");
}


const button = document.getElementById("registerbtn") as HTMLButtonElement;

button.addEventListener("click", () => {
    alert("Button was clicked!");
});