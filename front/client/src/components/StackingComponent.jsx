import React, { useState, useRef, useEffect } from "react";
import ERC20 from "../contracts/ERC20.json";
import FormField from "../utils/FormField";
import CardComponent from "../utils/CardComponent";
import AlertComponent from "../utils/AlertComponent";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function StackingComponent({web3, accounts, contract}){
	const formStakingCreation = useRef(null);
	const [error,setError] = useState(null);
	

	//Stake an amount of en ERC20 token
	const registeringStaking = async () => {
		const proposalToken = formStakingCreation.current.token.value;
		const proposalAmount = formStakingCreation.current.amount.value;
		
		if(proposalToken.trim() !== '' && web3.utils.isAddress(proposalToken) && proposalAmount > 0){
			
			// Get the contract instance of the token proposed
			const token = new web3.eth.Contract(ERC20.abi, proposalToken);
				
			const allowance = await token.methods.allowance(accounts[0],contract._address).call();

			if(allowance < proposalAmount) {
				await token.methods.approve(contract._address,proposalAmount).send({from: accounts[0]})
				.on("receipt",function(receipt){
					console.log("Approval");
				})
				.on("error",function(error){
					const parsedError = JSON.stringify(error.message);
					if (parsedError.includes('revert ')) {
						setError(parsedError);
					}
				});
			}
			
			await contract.methods.stake(proposalToken,proposalAmount).send({from: accounts[0]})
			.on("receipt",function(receipt){
				formStakingCreation.current.token.value = "0x...";
				formStakingCreation.current.amount.value = "";
			})
			.on("error",function(error){
				const parsedError = JSON.stringify(error.message);
				if (parsedError.includes('revert ')) {
					setError(parsedError);
				}
			});
			
		}
	};


	return <>
		<div className="container mt-4">
			<Row>
				{error && <AlertComponent>{error}</AlertComponent>}
			</Row>
			<Row>
				<Col>
					<CardComponent title="Stake your token" >
						<Form ref={formStakingCreation}>
							<FormField name="token" label="ERC20 Token :" placeholder="0x..." />
							<FormField name="amount" label="Amount with decimals :" />
						</Form>
						<Button onClick={registeringStaking} type="submit" variant="secondary" size="sm"> Go </Button>
					</CardComponent>
				</Col>
			</Row>
		</div>
	</>
}