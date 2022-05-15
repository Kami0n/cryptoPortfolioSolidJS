import { createSignal, For, onMount, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import Display from "./Display";

console.clear();
const coinsList = async () => (await fetch("https://api.coingecko.com/api/v3/coins/list")).json();
const coinPrice = async (param) => (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${param[0]}&vs_currencies=${param[1]}`)).json();

const getPrice = (pricesData, id) => {
	if(pricesData[id] == undefined){
		return 0
	}
	return pricesData[id].eur
}

function App() {
	const url = "http://localhost:10000/cryptoPortfolio";
	
	const [assetsStore, setAssetsStore] = createStore({
		items: [],
		sumNow:0,
		sumInvest:0,
		totalProfit: 0,
		totalPercent: 0,
	});
	function updateAll(){
		setAssetsStore('items', {}, asst => ({ currentPrice: (asst.currentPrice) }));
		setAssetsStore('items', {}, asst => ({ worth: asst.currentPrice * asst.qty }));
		setAssetsStore('items', {}, asst => ({ profit: asst.worth - asst.invested }));
		setAssetsStore('items', {}, asst => ({ percent: ( asst.invested > 0 ?  asst.profit/asst.invested * 100 : 0 )}));
		
		let sumInvest = 0;
		let sumNow = 0;
		assetsStore.items.map(n => {
			sumInvest += n.invested;
			sumNow += n.worth;
		})
		setAssetsStore('sumNow', sumNow);
		setAssetsStore('sumInvest', sumInvest);
		
		let totalProfit = assetsStore.sumNow - assetsStore.sumInvest;
		setAssetsStore('totalProfit', totalProfit);
		
		let totalPercent = totalProfit / assetsStore.sumInvest * 100
		setAssetsStore('totalPercent', totalPercent);
	}
	const getAssets = async () => {
		const response = await fetch(url);
		const assetsData = await response.json();
		
		let ids = "";
		assetsData.forEach(function (value) {
			ids = ids+value.id+",";
		});
		coinPrice([ids, "eur,usd"]).then((coinprices) => {
			assetsData.forEach(function (value, key) {
				let priceThisCoin = getPrice(coinprices, value.id);
				assetsData[key].currentPrice = priceThisCoin;
			});
			setAssetsStore({items: assetsData});
			updateAll();
			console.log(assetsStore.items);
			
		});
	};
	
	onMount(() => {
		getAssets();
	});
	
	
	const addAsset = (name) => {
		setAssetsStore('items', assets => [...assets, {name: "ADA", id:"cardano", qty: 1, invested: 1 }]);
		updateAll();
	}
	
	const removeAsset = (name) => {
		setAssetsStore('items', assets => assets.filter((asset) => asset.name !== name));
		updateAll();
	}
	
	const toggleInputAsset = (name, type) => {
		setAssetsStore('items', assets => assets.name !== name, "showInput", undefined );
		setAssetsStore('items', assets => assets.name === name, "showInput", type );
	};
	
	let input;
	const editAsset = (input, name, type) => {
		const valueParsed = parseFloat(input.value);
		setAssetsStore('items', assets => assets.name === name, type, valueParsed );
		input.value = "";
		setAssetsStore('items', assets => assets.name === name, "showInput", undefined );
		updateAll();
		console.log(assetsStore);
	};
	
	
	return (
	<>
		<header class="bd-header bg-dark py-3 d-flex align-items-stretch border-bottom border-dark">
			<div class="container-fluid d-flex align-items-center">
				<h1 class="d-flex align-items-center fs-4 text-white mb-0">
					Crypto Portfolio Tracker
				</h1>
			</div>
		</header>
		<div class="main-content container-fluid bg-body">
			<Display assets={ assetsStore } toggleInputAsset={toggleInputAsset} input={input} editAsset={editAsset} removeAsset={removeAsset} />
		</div>
	</>
);
}
export default App;
