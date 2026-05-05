import express from 'express'

const app = express();

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
   res.send("server is alive running restfullblog api")
})

app.listen(PORT, () => {
   console.log(`server is running restfullblogapi on http://localhost:${PORT}`)
})

