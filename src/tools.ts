export function promisify<T>(func: (callback: (err: any, res?: T) => void) => void)
{
	return new Promise<T>((resolve, reject) => func((err, res) => err ? reject(err) : resolve(res) ))
}
export function ignoreError<T>(p: Promise<T>, def: T, onError?: (err: any) => void)
{
	return p.catch(e => ((onError && onError(e)), def))
}