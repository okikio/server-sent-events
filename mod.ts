import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { html, raw } from 'https://deno.land/x/hono/helper.ts'
import { stream, streamText, streamSSE } from 'https://deno.land/x/hono/helper.ts'

const app = new Hono()

app.get('/', (ctx) => {
  return ctx.html(html`
    <html>
      <head>
        <title>Test Site </title>
      </head>
      <body>
        <button id="btn">Request</button>
        <ul id="result"></ul>

        <script type="module">
          const output = result;
          console.log({
            output,
            btn
          })
          btn.onclick = async () => {
            try {
              console.log("Cool");
              const res = await fetch("./request");
              const json = await res.json();

              console.log({
                json,
              });
            } catch (e) {
              console.log(e);
            }
          };

          await (async function () {
            const sse = new EventSource("./sse");
            const newElement = document.createElement("li");
            console.dir(newElement)
            sse.addEventListener('time-update', (ev) => {
              try {
                const newElementClone = newElement.cloneNode(true);
                newElementClone.textContent = \`- \${ev.data}\`;

                console.log(ev);
                output.appendChild(newElementClone);
              } catch (e) {
                console.log(e);
              }
            })

            
          })()
        </script>
      </body>
    </html>
  `)
})

app.get('/request', (ctx) => {
  return ctx.json({
    message: "Cool"
  })
})

app.get("/sse", (ctx) => {
  let id = 0;
  return streamSSE(ctx, async (stream) => {
    while (true) {
      const message = `It is ${new Date().toISOString()}`
      await stream.writeSSE({
        data: message,
        event: 'time-update',
        id: String(id++),
      })
      await stream.sleep(1000)
    }
  })
})


Deno.serve(app.fetch)
