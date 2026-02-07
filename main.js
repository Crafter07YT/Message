// Hearts on click
document.addEventListener("click", e => {
    let x = e.clientX;
    let y = e.clientY;
    const emojis = ["💜","🌷","🤍"];
    for(let i=0;i<10;i++){
        let heart = document.createElement("div");
        heart.className="heart";
        heart.textContent=emojis[Math.floor(Math.random()*emojis.length)];
        heart.style.left = x + "px";
        heart.style.top = y + "px";
        heart.style.setProperty("--x", (Math.random()-0.5)*400 + "px");
        heart.style.setProperty("--y", (Math.random()-0.5)*400 + "px");
        document.body.appendChild(heart);
        setTimeout(()=>heart.remove(),2500);
    }
});

// Messages animation
const boxes = document.querySelectorAll('.msg-box');
const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting) entry.target.classList.add('show');
    });
},{threshold:0.1});
boxes.forEach(box => observer.observe(box));

// Popup
const popup = document.getElementById('popup');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
popup.style.display='flex';
document.body.classList.add('popup-active');

// Yes button
yesBtn.addEventListener('click', ()=>{
    popup.style.display='none';
    document.body.classList.remove('popup-active');
    boxes.forEach((box, i)=> setTimeout(()=>box.classList.add('show'), i*400));
});

// No button random move
function moveNo() {
    const padding = 20;
    const x = Math.random()*(window.innerWidth - noBtn.offsetWidth - padding);
    const y = Math.random()*(window.innerHeight - noBtn.offsetHeight - padding);
    noBtn.style.position='fixed';
    noBtn.style.left = x+'px';
    noBtn.style.top = y+'px';
}
noBtn.addEventListener('pointermove', moveNo);

// Petals
const petalsArr = ["🌸", "🌷", "💮"];
function createPetal(){
    const p = document.createElement('div');
    p.className='petal';
    const size = Math.random()*30 + 28;
    p.style.fontSize = size + "px";
    p.style.filter = Math.random()<0.4 ? "blur(4px)" : "none";
    p.style.animationDuration = (Math.random()*10 + 12) + "s";
    p.style.left = Math.random()*100 + "vw";
    p.textContent = petalsArr[Math.floor(Math.random()*petalsArr.length)];
    p.style.setProperty("--dx", (Math.random()*400 - 200) + "px");
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), parseFloat(p.style.animationDuration)*1000);
}
setInterval(createPetal, 450);