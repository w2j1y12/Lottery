module.exports = async (promise) => {
    try {
        await promise;
        AuthenticatorAssertionResponse.fail('Expected revert not recevied')
    } catch(error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
    }
}