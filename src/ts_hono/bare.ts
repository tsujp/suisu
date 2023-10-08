import { type Serve } from 'bun'

const app = () => {
	const s = Bun.serve({
		fetch(req, wat) {
			return new Response('Howdy!')
		}
	})

	return s
}

export default app()

// export default {
// 	fetch(req) {
// 		return new Response('Howdy!')
// 	}
// } satisfies Serve
