// node_modules
const { Wallets } = require('fabric-network');
const shell = require('shelljs');
const colors = require('colors');
const path = require('path');

// tools & paths
const bashFilesDir = path.join(process.cwd(), 'bash-files');


// register and enroll the user
async function registerUser(username, userOrg, res)
{
    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // *****************************************************
    //                check user existence
    // *****************************************************

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet of ${userOrg}`);
        return res.status(409).send({
            success: false,
            message: `${username} already exists in ${userOrg}`,
        });
    }


    // *****************************************************
    //             Register and Enroll the User
    // *****************************************************

    let orgName = userOrg.toLowerCase();
    let orgNumber = orgName.match(/\d/g).join("");


    let shellResult = shell.exec(`${bashFilesDir}/userActions.sh ${username} ${orgName} ${orgNumber} client`, {silent: true});

    if (shellResult.code !== 0) {
        let shellError = shellResult.stderr;
        console.log(colors.bgRed("Error in userActions.sh"));
        console.log(colors.red(shellError));
        return res.status(500).send("Error in registering/enrolling the user");
    }

    let orgDir = getOrgDir(orgName);    // path of the org directory

    let certificate_file = path.join(orgDir, `users/${username}@${orgName}.example.com/msp/signcerts/cert.pem`);
    let privateKey_path = path.join(orgDir, `users/${username}@${orgName}.example.com/msp/keystore`);

    let certificate = await getUserCertificate(certificate_file);
    let privateKey = await getUserPrivateKey(privateKey_path);

    let x509Identity = {
        credentials: { certificate, privateKey },
        mspId: `${orgName}MSP`,
        type: 'X.509',
    };
    

    // import the identity into the wallet
    await wallet.put(username, x509Identity);
    console.log(colors.green(`Successfully registered and enrolled user '${username}' and imported into the wallet.`));

    return res.send({
        success: true,
        message: `${username} enrolled Successfully in ${orgName}`,
    })
}


// invoke transaction
async function invokeTransaction(username, orgName, orgNumber, args, res)
{
    console.log(colors.blue(`*** Chaincode invoke for adding asset with key: ${args[0]} ***`));

    // let channelName = process.env.channelName;
    // let chaincodeName = process.env.chaincodeName;

            
    let shellResult = shell.exec(`${bashFilesDir}/createCar.sh ${username} ${orgName.toLowerCase()} ${orgNumber} \
        ${args[0]} ${args[1]} ${args[2]} ${args[3]} ${args[4]}`, {silent: true});

    if (shellResult.code !== 0) {
        let shellError = shellResult.stderr;
        console.log(colors.bgRed("Error in createCar.sh"));
        console.log(colors.red(shellError));
        return res.status(500).send(`Error in adding asset with key: ${args[0]}`);
    }

    else {
        console.log(colors.green(`* Successfully added the asset with key: ${args[0]}`));
        return res.send(`Successfully added the asset with key: ${args[0]}`);
    }
}


// check user existence
async function checkUserExistence(username, orgName) 
{
    const walletPath = await getWalletPath(orgName)
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const userIdentity = await wallet.get(username);
    if (userIdentity) return true;
    return false;
}


// get the path of the org's wallet
async function getWalletPath(org) {
    let orgNumber = org.match(/\d/g).join("");
    let walletPath = path.join(process.cwd(), `wallets/org${orgNumber}-wallet`);
    return walletPath;
}

// get the path of the org's wallet
async function getOrgDir(orgName) {
    let orgPath = path.join(process.cwd(), `../crypto-config/peerOrganizations/${orgName}.example.com`);
    return orgPath;
}





module.exports = {
    registerUser,
    invokeTransaction,
    checkUserExistence
}