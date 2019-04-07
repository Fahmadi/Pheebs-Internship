const redis = require('./redis')
const readline = require('readline')
var Redlock = require('redlock');

var redlock = new Redlock(
	// you should have one client for each independent redis node
	// or cluster
	[redis],
	{
		// the expected clock drift; for more details
		// see http://redis.io/topics/distlock
		driftFactor: 0.01, // time in ms

		// the max number of times Redlock will attempt
		// to lock a resource before erroring
		retryCount:  2,

		// the time in ms between attempts
		retryDelay:  200, // time in ms

		// the max time in ms randomly added to retries
		// to improve performance under high contention
		// see https://www.awsarchitectureblog.com/2015/03/backoff.html
		retryJitter:  200 // time in ms
	}
);

const  ttl = 1000;


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getDate = () => {
    const date = new Date()
    date.setDate(date.getDate())
    return date
  }

const getInput = (textQuestion) => {
    return new Promise((resolve,reject)=> {
        rl.question(textQuestion, (answer)=> {
            resolve(answer)
        })
    })
}

const createAccount = async () => {
    const userId = await getInput('enter user id');
    const amount = await getInput('enter amounts of cash')
    const newAccount = await redis.hset('users:amount',userId,amount)
    console.log(newAccount)
}

const transferMoney = async () => {
    const sourceAccount = await getInput('enter sourceAccount');
    const destinationAccount = await getInput('enter destinationAccount');
    const money = await getInput ('enter amount of money ')

    const sourceLock = await redlock.lock(`locks: ${sourceAccount}`, ttl)

    const sourceAccountAmount = await redis.hget('users:amount',sourceAccount)

    const destLock = await redlock.lock(`locks: ${destinationAccount}`, ttl)

    const destinationAccountAmount = await redis.hget('users:amount',destinationAccount)

    console.log(sourceAccountAmount)
    if (sourceAccountAmount >= parseInt(money)){
        await redis.set(sourceAccount, sourceAccountAmount - money)
        const sum = parseInt(destinationAccountAmount) + parseInt(money)
        await redis.set(destinationAccount, sum)

        const date = getDate()
        const tr = await redis.lpush(`transaction:s:${sourceAccount}:d:${destinationAccount}`, JSON.stringify({date, money}))
        console.log(tr)
    }
    else{
        console.log('your money does not enough!')
    }

   

    await sourceLock.unlock()
    await destLock.unlock()
}

const returnTransactions = async () => {
    
    const res = await redis.lrange('', -1,-10, )
    return res
}

const main = async () => {
    // await createAccount()
    await transferMoney()
    // await returnTransactions()
}

main().then(function(result){
return result
})