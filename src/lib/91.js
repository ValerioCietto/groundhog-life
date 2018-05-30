exports.userInventory = exports.kongItems = exports.marketItems = exports.tachyonCache = void 0;

var c = require(54), d = require(174), f = require(114), v = require(84), p = require(85);
import PlayFabClient from 'playfab-sdk/Scripts/PlayFab/PlayFabClient';
import { NumberStateEntity } from './state-entities';
import { addTachyons } from './kongregate';

function consumeItemCallback(error, result) {
    if (result === null)
        console.log(error);
}

function consumeItem(item) {
    const request = {
        ItemInstanceId: item.ItemInstanceId, ConsumeCount: 1
    };
    PlayFabClient.ConsumeItem(request, consumeItemCallback);
}

function postPurchase(item) {
    if (item.ItemId === "lifetime_boost") {
        c.bonusTicks.add(15330);
        consumeItem(item);
    }
    else if (item.ItemId === "dark_matter_rituals") {
        c.darkMatterTicks.add(3650);
        consumeItem(item);
    }
    else if (item.ItemId === "instant_groundhog") {
        (f.prestigeAction)(false);
        consumeItem(item);
    }
}

export let tachyonCache = new NumberStateEntity("tachyon_cache", "Tachyon Cache", 0, false, 0);

class MarketItems {
    items = [];
    purchasing = false;
    populate(e) {
        this.items = e;
    }
    purchase(item) {
        if (!this.purchasing) try {
            this.purchasing = true;
            const request = {
                ItemId: item.ItemId,
                VirtualCurrency: "TA",
                Price: item.VirtualCurrencyPrices.TA
            };
            PlayFabClient.PurchaseItem(request, purchaseItemCallback);
        } catch (e) {
            this.purchasing = false;
        }
    }
}

function purchaseItemCallback(error, result) {
    marketItems.purchasing = false;
    if (null !== result) {
        userInventory.tachyons -= result.data.Items[0].UnitPrice;
        userInventory.addItem(result.data.Items[0]);
        postPurchase(result.data.Items[0]);
    }
    else
        console.log(error);
}

export let marketItems = new MarketItems();

class KongItems {
    items = [];
    userItems = [];
    consumed(e) {
        for (let item of this.userItems) {
            if (item.id === e) {
                if ("basic_pack" === item.identifier) {
                    addTachyons(2e3);
                    d.purchasedSomething.setValue(true);
                }
                else if ("supporters_pack" === item.identifier) {
                    addTachyons(5e3);
                    d.purchasedSomething.setValue(true);
                }
                else if ("z_super_pack" === item.identifier) {
                    addTachyons(1e4);
                    d.purchasedSomething.setValue(true);
                }
            }
        }
    }
}

export let kongItems = new KongItems();

class UserInventory {
    tachyons = 0;
    items = [];
    haveAutoPromote = false;
    haveAutoResearch = false;
    haveAutoBoost = false;
    haveMinimalism = false;
    haveShadyDoctor = false;
    updateAutos() {
        for (let item of this.items) {
            if ("auto_promote" === item.ItemId)
                this.haveAutoPromote = true;
            if ("auto_research" === item.ItemId)
                (this.haveAutoResearch = true);
            if ("auto_boost" === item.ItemId)
                this.haveAutoBoost = true;
            if ("minimalism" === item.ItemId)
                this.haveMinimalism = true;
            if ("shady_doctor" === item.ItemId)
                this.haveShadyDoctor = true;
        }
        p.shadyDoctor.setValue(this.haveShadyDoctor);
        p.minimalism.setValue(this.haveMinimalism);
        if (!this.haveAutoPromote)
            v.autoPromote.setValue(false);
        if (!this.haveAutoResearch)
            v.autoResearch.setValue(false);
        if (!this.haveAutoBoost)
            v.autoBoost.setValue(false);
    }
    initialize(e, t) {
        this.tachyons = e;
        this.items = t;
        this.updateAutos();
    }
    addItem(e) {
        this.items.push(e);
        this.updateAutos();
    }
    have(e) {
        for (let item of this.items)
            if (e.ItemId === item.ItemId)
                return true;
        return false;
    }
}

export let userInventory = new UserInventory();
