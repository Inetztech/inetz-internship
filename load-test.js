const autocannon = require('autocannon');

// 🎯 Paste your token or cookie here
const AUTH_COOKIE = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..LRf8dBlFJf9hEIsz.o0agUtZyjfqpSLuIFkZUQtZk0MRwIuvkLf_6h2pWVcW1n5lLkaEByjdUus0GaZ80RaPjBNJto-fioxyGdyWl0RD-mjlbBG4iVQzUq-HP4lRfkBr9MV0DWOX5elv9XtDdlKXys-vRUn_d1i7h0Z3kCH__QjbnZuj7zomsh7QxxdIe6Jp3VGK9udK-6njrlHqPwDifj24UHplbLnUmGIWc-dZ4C4lfOpYMmMA2Wz6foui4489iXBenb9QHE5jqjSpoZ1yIlOvkHRkD9gkAa-_ZJ5BN5j6ykYWS.6KVDbSuus9_PMtwWhQ_fzw';
// const BEARER_TOKEN = 'Bearer YOUR_COPIED_JWT_TOKEN';

async function runBenchmark() {
  console.log('🚀 Starting Authenticated Autocannon Load Test...\n');

  const instance = autocannon({
    url: 'http://127.0.0.1:3000/api/programs',
    connections: 50,
    duration: 10,
    headers: {
      'content-type': 'application/json',
      'cookie': AUTH_COOKIE,
      // 'authorization': BEARER_TOKEN,
    },
  });

  autocannon.track(instance, { renderProgressBar: true });

  const result = await instance;
  console.log('\n✅ Load Test Finished!');
  console.log(`Average Latency: ${result.latency.average} ms`);
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Successful 2xx Responses: ${result['2xx']}`);
  console.log(`Non-2xx / Error Responses: ${result.non2xx}`);
}

runBenchmark();