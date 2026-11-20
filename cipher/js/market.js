const API = {me: "/api/me"};

const MOCK_ME = {name:"0xK3Y_NOO3", role:"user" , coins : 65};

async function getJSON(url, fallback){
    try {
        const res = await fetch (url, {credentials: "same-origin"});
        if (!res.ok) throw new Error(res.status);
        return await res.json;
    }
    catch (e){
        console.warn("API Not working, Fallback data is being used", url,e);
        return fallback;
    }
}

(async function(){
    const me = await getJSON(API.me, MOCK_ME);
    document.getElementById("navAgent").textContent= me.namae;
    document.getElementById("navCoins").textContent=   `${me.coins} Coins`;
    document.getElementById("balance").textContent = `${me.coins} Coins`;
})();