define(
    [],
    function() {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }  
    
        return {
            sleep: sleep
        }
    }
);