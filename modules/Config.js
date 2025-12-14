class Config {
    constructor() {
        this.Storage_Key = 'artist_timeline_config';
        this.Defaults = {
            orientation : 'horizontal',
            cardSize : 'medium',
            autoScrollToPlay : true,
            animationSpeed : 0,
            proportionalSpacing: false,
            showScrollButtons: true,
            minSpacing: 20,
            maxSpacing: 200,
        };
        this.config = this.load();
    }

    load() {
        try{
            const saved = localStorage.getItem(this.Storage_Key);
            if(saved){
                return {...this.Defaults, ...JSON.parse(saved)};
            }
        }
        catch (error) {
            console.error('Error loading config:', error);
        }
        return {...this.Defaults};
    }

    // How It works:
    // Take the config object
    // Convert it to a JSON string
    // Save it to localstorage
    save(config) {
        try{
            const jsonString = JSON.stringify(config);
            localStorage.setItem(this.Storage_Key, jsonString);
            this.config = config;
        }
        catch (error) {
            console.error('Error saving config:', error);
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.save(this.config);
    }

    reset() {
        this.config = {...this.Defaults};
        this.save(this.config);
    }
}