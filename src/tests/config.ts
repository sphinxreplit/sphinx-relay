// iterate: try all combinations of nodes!

export const config = {
  iterate: true,
  memeHost: process.env.MEME_HOST || 'localhost:5555',
  tribeHost: process.env.TRIBE_HOST || 'localhost:13000',
  tribeHostInternal: 'tribes.sphinx:13000',
  allowedFee: 4,
}
