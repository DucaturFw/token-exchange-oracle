declare module "wallet-address-validator"
{
	export function validate(address: string, currency: string = 'bitcoin', networkType: string = 'prod');
}