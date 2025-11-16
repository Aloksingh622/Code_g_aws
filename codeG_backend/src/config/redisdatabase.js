let {createClient} =require('redis')

const redisclient = createClient({
    username: 'default',
    password: '2AIo4Whrxg1kp46512gGCmvWiu9vVgxk',
    socket: {
        host: 'redis-15218.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 15218
    }
});




module.exports=redisclient;


