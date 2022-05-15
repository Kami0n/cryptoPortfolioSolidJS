import { For } from "solid-js";

export default function Display(props) {
	let decimals = 8;
	let decimalsCurrency = 2;
	console.log(props);
	
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
	
	return (
		<>
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
				<For each= {props.assets.items } fallback={ <h1>Loading...</h1> }>
					{(asset) => (
						<>
							<div class="asset list-group-item-action list-group-item-light">
								<div class="name">{asset.name}</div>
								<div class="number qty" ondblclick={() => { props.toggleInputAsset(asset.name, "qty") }}>
									<Show when={asset.showInput === "qty"} fallback={parseFloat(asset.qty).toFixed(decimals)} >
										<input type="number" ref={props.input} name="invested" size="1" placeholder="0.00000000"
											value={parseFloat(asset.qty).toFixed(decimals)} autofocus
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													props.editAsset( props.input, asset.name, "qty");
												}
											}}
											onfocusout={(e) => {
												props.editAsset( props.input, asset.name, "qty");
											}} >
										</input>
									</Show>
								</div>
								<div class="number invested" ondblclick={() => { props.toggleInputAsset(asset.name, "invested") }}>
									<Show when={asset.showInput === "invested"} fallback={parseFloat(asset.invested).toFixed(decimalsCurrency)} >
										<input type="number" ref={props.input} name="invested" size="1" placeholder="0.00"
											value={parseFloat(asset.invested).toFixed(decimalsCurrency)} autofocus
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													props.editAsset( props.input, asset.name, "invested");
												}
											}}
											onfocusout={(e) => {
												props.editAsset( props.input, asset.name, "invested");
											}} >
										</input>
									</Show>
								</div>
								<div class="number currentPrice">{ asset.currentPrice.toFixed(decimals) }</div>
								<div class="number worth">{ parseFloat(asset.worth).toFixed(decimalsCurrency) }</div>
								<div class="number percent" style={getColor(asset.percent, 100)}>{ parseFloat(asset.percent).toFixed(decimalsCurrency) } %</div>
								<div class="number profit">{ parseFloat(asset.profit).toFixed(decimalsCurrency)}</div>
							</div>
						</>
					)}
				</For>
				<div class="asset legend list-group-item-action list-group-item-dark">
					<div class="name">SUM</div>
					<Show when={props.assets.sumInvest > 0} fallback={<div>0</div>}>
						<div class="number"></div>
						<div class="number">{ parseFloat(props.assets.sumInvest).toFixed(decimalsCurrency) }</div>
						<div class="number"></div>
						<div class="number">{ parseFloat(props.assets.sumNow).toFixed(decimalsCurrency) }</div>
						<div class="number" style={ getColor(props.assets.totalPercent, 100) }>{ parseFloat(props.assets.totalPercent).toFixed(decimalsCurrency) } %</div>
						<div class="number">{ parseFloat(props.assets.totalProfit).toFixed(decimalsCurrency) }</div>
					</Show>
				</div>
			</div>
		</>
	);
}
