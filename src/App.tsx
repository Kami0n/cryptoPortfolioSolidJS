import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import assetsJson from '../data.json';

const coinsList = async () =>
	(await fetch("https://api.coingecko.com/api/v3/coins/list")).json();

const coinPrice = async (param) =>
	(await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${param[0]}&vs_currencies=${param[1]}`)).json();

function DisplayTable(pricesData) {
	
	
	const [state, setState] = createStore(assetsJson);
	
	const lastPos = new WeakMap();
	const curPos = new WeakMap();
	/* const getSorted = createMemo((list = []) => {
		list.forEach((p, i) => lastPos.set(p, i));
		
		const newList = state.assets.slice().sort((a, b) => {
			if (b.name === a.name)
				return a.name.localeCompare(b.name);
			return b.name - a.name;
		});
		let updated = newList.length !== list.length;
		newList.forEach(
			(p, i) => lastPos.get(p) !== i && (updated = true) && curPos.set(p, i)
		);
		return updated ? newList : list;
	}); */
	
	const MAX = 100;
	const getColor = (n, max) => {
		
		if(n>100){
			n = 100;
		}
		if(n > 0){
			return `background-color:hsl(130, 100%, ${((1-n/max)) * 80+20}%)`
		}
		n = Math.abs(n);
		return `background-color:hsl(0, 100%, ${((1-n/max)) * 80+20}%)`
	}
	
	const getPrice = (id) => {
		console.log(pricesData[id])
		if(pricesData[id] == undefined){
			return 0
		}
		return pricesData[id].eur
	}
	
	let sumInvest = 0;
	let sumNow = 0;
	
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
			<For each={assetsJson.assets}>
				{(asset) => {
					
					var decimals = 8;
					
					const {name} = asset;
					
					let qtyDisplay = asset.qty.toFixed(decimals);
					let priceNow = getPrice(asset.id);
					let priceNowDisplay = priceNow.toFixed(decimals);
					
					sumInvest = sumInvest + asset.invested;
					let investedDisplay = asset.invested.toFixed(2);
					let worth = priceNow * asset.qty;
					sumNow = sumNow + worth;
					let worthDisplay = worth.toFixed(2);
					let profit = worth - asset.invested;
					let profitDisplay = profit.toFixed(2);
					
					let percent = 0;
					if(asset.invested != 0){
						percent = profit/asset.invested * 100;
					}
					
					let percentDisplay = percent.toFixed(0);
					//const getStyles = createStyles(asset);  style={getStyles()}
					return (
						<div class="asset list-group-item-action list-group-item-light">
							<div class="name">{name}</div>
							<div class="number qty">{qtyDisplay}</div>
							<div class="number invested">{investedDisplay}</div>
							<div class="number priceNow">{priceNowDisplay}</div>
							<div class="number worth">{worthDisplay}</div>
							<div class="number percent" style={getColor(percentDisplay, MAX)}>{percentDisplay} %</div>
							<div class="number profit">{profitDisplay}</div>
						</div>
					);
				}}
			</For>
			
			<div class="asset legend list-group-item-action list-group-item-dark">
				<div class="name">SUM</div>
				<div class="number"></div>
				<div class="number">{sumInvest.toFixed(2)}</div>
				<div class="number"></div>
				<div class="number">{sumNow.toFixed(2)}</div>
				<div class="number" style={getColor(((sumNow-sumInvest)/sumInvest*100), MAX)}>{((sumNow-sumInvest)/sumInvest*100).toFixed(0)} %</div>
				<div class="number">{(sumNow-sumInvest).toFixed(2)}</div>
			</div>
		</div>
		
	)
}



const App: Component = () => {
	let newName, newqty;
	
	let ids = "";
	assetsJson.assets.forEach(function (value) {
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
				{pricesSignal}
			</div>
		</>
	);
};

export default App;
