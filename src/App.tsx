import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

import assetsJson from '../data.json';

console.clear();
const coinsList = async () => (await fetch("https://api.coingecko.com/api/v3/coins/list")).json();
const coinPrice = async (param) => (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${param[0]}&vs_currencies=${param[1]}`)).json();

const DisplayTable = (pricesData) =>{
	
	
	const getColor = (n, max) => {
		if(n > 100){
			n = 100;
		}
		if(n > 0){
			return `background-color:hsl(130, 100%, ${((1-n/max)) * 80+20}%)` // positive - green
		}
		n = Math.abs(n);
		return `background-color:hsl(0, 100%, ${((1-n/max)) * 80+20}%)` // negative - red
	}
	
	const getPrice = (id) => {
		//console.log(pricesData[id])
		if(pricesData[id] == undefined){
			return 0
		}
		return pricesData[id].eur
	}
	
	const [assetsStore, setAssets] = createStore({
		items: [],
		sumNow:0,
		sumInvest:0,
		totalProfit: 0,
		totalPercent: 0,
	})
	setAssets(assetsJson);
	
	/*,
	handleQtyClick = (asset) => {
		let val = asset.qty;
		let input = document.createElement("input");
		input.value = val;
		
	}*/;
	
	const addAsset = (name) => {
		setAssets('items', assets => [...assets, {name: "ADA", id:"cardano", qty: 1, invested: 1 }]);
		
		updateAll();
	}
	
	const removeAsset = (name) => {
		setAssets('items', assets => assets.filter((asset) => asset.name !== name));
		
		updateAll();
	}
	
	const editInvestedAsset = (name) => {
		setAssets('items', assets => assets.name === name, "invested", 20 );
		
		updateAll();
	};
	
	const editQtyAsset = (name) => {
		console.log(name);
		setAssets('items', assets => assets.filter((asset) => asset.name !== name));
		
		updateAll();
	}
	
	// dont know if this is the best way, but it works
	function updateAll(){
		setAssets('items', {}, asst => ({ priceNow: getPrice(asst.id) }));
		setAssets('items', {}, asst => ({ worth: asst.priceNow * asst.qty }));
		setAssets('items', {}, asst => ({ profit: asst.worth - asst.invested }));
		setAssets('items', {}, asst => ({ percent: ( asst.invested > 0 ?  asst.profit/asst.invested * 100 : 0 ) }));
		
		let sumInvest = 0;
		let sumNow = 0;
		assetsStore.items.map(n => {
			sumInvest += n.invested;
			sumNow += n.worth;
		})
		setAssets('sumNow', sumNow);
		setAssets('sumInvest', sumInvest);
		
		let totalProfit = assetsStore.sumNow - assetsStore.sumInvest;
		setAssets('totalProfit', totalProfit);
		
		let totalPercent = totalProfit / assetsStore.sumInvest * 100
		setAssets('totalPercent', totalPercent);
	}
	updateAll();
	
	const decimals = 8;
	const MAX = 100;
	
	return (
		<div class="assetsGrid">
			<div class="asset legend list-group-item-action list-group-item-dark">
				<div class="name">Name</div>
				<div class="">Quantity</div>
				<div class="">Invested [€]</div>
				<div class="">Price now [€]</div>
				<div class="">Worth now [€]</div>
				<div class="">Percent change [%]</div>
				<div class="">Profit [€]</div>
			</div>
			
			<For each={assetsStore.items}>{(asset) => {
					return (
						<div class="asset list-group-item-action list-group-item-light">
							<div class="name">{asset.name}</div>
							
							<div class="number qty" ondblclick={() => { editQtyAsset(asset.name); }}>{asset.qty.toFixed(decimals)}</div>
							<div class="number invested" ondblclick={() => { editInvestedAsset(asset.name); }}>{asset.invested.toFixed(2)}</div>
							
							<div class="number priceNow">{ asset.priceNow.toFixed(decimals) }</div>
							<div class="number worth">{asset.worth.toFixed(2)}</div>
							<div class="number percent" style={getColor(asset.percent, MAX)}>{asset.percent.toFixed(0)} %</div>
							<div class="number profit">{asset.profit.toFixed(2)}</div>
						</div>
					);
				}}
			</For>
			
			<div class="asset legend list-group-item-action list-group-item-dark">
			<div class="name">SUM</div>
				<Show when={assetsStore.sumInvest > 0} fallback={<div></div>}>
					<div class="number"></div>
					<div class="number">{ assetsStore.sumInvest.toFixed(2) }</div>
					<div class="number"></div>
					<div class="number">{ assetsStore.sumNow.toFixed(2) }</div>
					<div class="number" style={ getColor(assetsStore.totalPercent, MAX) }>{ (assetsStore.totalPercent).toFixed(0) } %</div>
					<div class="number">{ (assetsStore.totalProfit).toFixed(2) }</div>
				</Show>
			</div>
		</div>
	)
}

const App: Component = () => {
	
	let ids = "";
	assetsJson.items.forEach(function (value) {
		ids = ids+value.id+",";
	});
	
	const [pricesSignal, setPrices] = createSignal();
	coinPrice([ids, "eur,usd"]).then((data) => {
		setPrices(DisplayTable(data))
	});
	
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
				{ pricesSignal }
			</div>
		</>
	);
};

export default App;
