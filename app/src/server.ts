import { init_db } from "./db_init.ts";
import { log } from "./logging.ts";
import express from 'express'
import { RateLimitError } from "./rate_limit.ts";
import { inc, metrics } from "./metrics.ts";
import { router } from "./controller.ts";
import bodyParser from "body-parser";


let app = express()

app.use(express.json())
app.use(bodyParser.json());


app.use((req, _, next) => {
  inc(metrics.requests, req.path)
  next()
})

app.get('/health', (_, res) => {
  res.send({ ok: true })
})

app.get('/metrics', (req, res) => {
  res.send({
    requests: Object.fromEntries(metrics.requests),
    errors: Object.fromEntries(metrics.errors),
    scores: Object.fromEntries(metrics.scores)
  })
})

app.use(router)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  log('error', 'unhandled_error', {
    path: req.path,
    method: req.method,
    message: err.message
  })

  
    if (err instanceof RateLimitError)
        return res.status(429).send({ error: 'Too many requests' })

  res.status(500).send({
    error: 'Internal server error'
  })
})



init_db().then(() => {

  const PORT = process.env.PORT || 3300

  app.listen(PORT, () => {
    console.log(`Mor Chess API running on ${PORT}`)
  })

})