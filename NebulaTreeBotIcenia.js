/*
Copyright (c) 2022 nebula <nebula161@users.noreply.github.com>
*/
// USE UNENCHANTED AXE
// CARRY FOOD, BUT NOT IN YOUR OFFHAND
GlobalVars.putInt("nebulaTreeBot-index", 0)
const isFirstSaplingSpacedOut = false // Are the first saplings right next to the edge of the tree farm?
const paneSpace = 3 // How many glass panes are there between each tree
const saplingSpacing = paneSpace + 1
const woodChoice = "spruce" // What type of tree are we harvesting?
const treeLength = 6 // After the first two we cut to get under the tree, how many blocks can we expect to have to break to break saplings?
const axeType = 'minecraft:iron_axe';
let sapling = `minecraft:${woodChoice}_sapling`
let wood = `minecraft:${woodChoice}_log`

const westSapling = -2345.474 // X coords of the westernmost sapling
const northSapling = -5529.439  // Z coords of the northernmost sapling
const eastSapling = -2237.459 // X coords of the easternmost sapling
const southSapling = -5421.319// Z coords of the southernmost sapling

let currentToolBreaktimeWood = 8


let p = Player


function applyToInventorySection(Player, section, call) {
    let inv = Player.openInventory() //opens inventory
    let slots = inv.getMap() //gets your inventory slots and puts it in an array

    if (slots[section]) {
        for (let i = 0; i < slots[section].length; i++) {
            let slot = slots[section][i]
            let item = inv.getSlot(slot)
            let dura = item.getMaxDamage() - item.getDamage()
            return call(i, slot, item, dura)

        }
    }
}

function getY() {
    return Player.getPlayer().getPos().y     //gets y position
}

function waitRealTick(wx) {
    if (typeof (wx) == "undefined") {
        wx = 1
    }
    minecraftSucksMultiplier = (20 / World.getServer1MAverageTPS()) + 1.5
    Client.waitTick(wx)
}

function waitServerTick(x) {
    if (x == null) {
        x = 1
    }
    Chat.log(Math.round(1000 * x *
        (1 / World.getServer5MAverageTPS())))
    Time.sleep(
        Math.round(1000 * x *
            (1 / World.getServer5MAverageTPS()))
    )
}

function slog(x) {
    Chat.log(`\u00A7f[\u00A75NebulaTreeBot\u00A7f]: ${x}`)
}

function pillarBlocks(n, eligibleBlocks) { //don't need for this script
    if (typeof (eligibleBlocks) != "Object") { throw ("'eligibleBlocks' isn't an array of strings as it should be, it's instead a " + typeof (eligibleBlocks)) }
    stopInputs()
    for (i = 0; i < n; i++) {
        KeyBind.keyBind("key.jump", true)
        waitRealTick(6) // A jump is 12 ticks, so wait 6 to reach the peak
        KeyBind.keyBind("key.jump", false)
        // Place cobblestone below self
        for (let j = 0; j < eligibleBlocks.length; j++) {
            pick(eligibleBlocks[j], 1, -1)
        }

        if (true) {
            Player.getPlayer().lookAt(0, 90)
            KeyBind.keyBind("key.use", true)
            waitRealTick() // You have to wait a tick to pass any inputs lol
            KeyBind.keyBind("key.use", false)
            waitRealTick(5)
        }

    }
}

function walkTo(Player, x, z, precise, timeout) {
    let position = Player.getPlayer().getPos() //gets position
    let tx = 0
    let tz = 0
    if (x == null) {
        tx = roundAndMid(Player.getPlayer().getX()) //gets you to midpoint of block
    }
    if (z == null) {
        tz = roundAndMid(Player.getPlayer().getZ()) //gets you to midpoint
    }
    if (precise) {
        tx = x
        tz = z
        if (x == null) {
            tx = Player.getPlayer().getX()
        }
        if (z == null) {
            tz = Player.getPlayer().getZ()
        }
    } else {
        if (x != null) {
            tx = roundAndMid(x)
        }
        if (z != null) {
            tz = roundAndMid(z)
        }
    }
    Chat.log("walking to " + tx + ", " + tz);

    KeyBind.keyBind("key.forward", true)
    let timer = 0;
    let flag = false
    let firstPitch = Player.getPlayer().getPitch()
    Player.getPlayer().lookAt(tx, Player.getPlayer().getY(), tz);
    Player.getPlayer().lookAt(Player.getPlayer().getYaw(), firstPitch)
    while (true) {
        waitRealTick();

        timer += 1;


        position = Player.getPlayer().getPos();
        if (Math.abs(position.x - tx) <= 1 && Math.abs(position.z - tz) <= 1) {
            Player.getPlayer().lookAt(tx, 0, tz);

            if (Player.getCurrentPlayerInput().sneaking == false) {
                KeyBind.keyBind("key.sneak", true);
            }
        }
        if (Math.abs(position.x - tx) < 0.075 && Math.abs(position.z - tz) < 0.075) {
            Player.getPlayer().lookAt(tx, Player.getPlayer().getY(), tz);
            Player.getPlayer().lookAt(Player.getPlayer().getYaw(), firstPitch)
            KeyBind.keyBind("key.forward", false);
            KeyBind.keyBind("key.sneak", false)
            break
        }
        if (timeout && timer > timeout) {
            Chat.log("walkTo timed out");

            KeyBind.keyBind("key.forward", false)
            KeyBind.keyBind("key.sneak", false)
            return false
        }

    }
    return true
}

function digDown(n) {
    stopInputs()
    let ty = Player.getPlayer().getY() - n
    if (pickPickaxe(null, 10)) {
        KeyBind.keyBind("key.attack", true)
        waitRealTick()
        botPlayer.lookAt(botPlayer.getYaw(), 90)
        while (Math.abs(ty - Player.getPlayer().getY()) > .999) {

            waitRealTick()
        }
        KeyBind.keyBind("key.attack", false)
    }
}


function countItems(p, name, location) {
    let count = 0
    let inv = Player.openInventory()
    let slots = inv.getMap()

    for (let i = 0; i < 9; i++) {
        let slot = slots["hotbar"][i]
        let item = inv.getSlot(slot)
        let dura = item.getMaxDamage() - item.getDamage()
        if (item.getItemID() === name) {
            count += item.getCount()
        }
    }
    for (let i = 0; i < 36; i++) {
        let slot = slots["main"][i]
        if (slot) {
            let item = inv.getSlot(slot)
            dura = item.getMaxDamage() - item.getDamage()
            if (item.getItemID() === name) {
                count += item.getCount()
            }
        }
    }
    return count
}

function pick(name, hotbar, dmg) {
    let inv = Player.openInventory()
    let slots = inv.getMap()

    if (hotbar == null) {
        hotbar = inv.getSelectedHotbarSlotIndex()
    }

    let slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()]
    let item = inv.getSlot(slot)
    let dura = item.getMaxDamage() - item.getDamage()
    if (item.getItemID() === name && (dmg === -1 || dura > dmg)) {
        inv.close()
        return true
    }

    for (let i = 0; i < 9; i++) {
        let slot = slots["hotbar"][i]
        let item = inv.getSlot(slot)
        let dura = item.getMaxDamage() - item.getDamage()
        if (item.getItemID() === name && (dmg == -1 || dura > dmg)) {
            inv.setSelectedHotbarSlotIndex(i)
            inv.close()
            return true
        }
    }
    for (let i = 0; i < 36; i++) {
        let slot = slots["main"][i]
        if (slot) {
            let item = inv.getSlot(slot)
            dura = item.getMaxDamage() - item.getDamage()
            if (item.getItemID() === name && (dmg === -1 || dura > dmg)) {
                inv.swap(slot, slots["hotbar"][hotbar])
                Time.sleep(250)
                inv.setSelectedHotbarSlotIndex(hotbar)
                inv.close()
                return true
            }
        }
    }
    inv.close()
    return false
}
function dropAllOfThisExcept(Player, name, amountToKeep) {
    if (amountToKeep == null) { amountToKeep = 0 }
    while (countItems(Player, name) > amountToKeep) {
        waitRealTick(5)
        pick(name, null, -1)
        waitRealTick(5)
        Player.getPlayer().getRaw().method_7290(true)
        waitRealTick(5)

    }
}
function dropLoot() {
    dropAllOfThisExcept(Player, "minecraft:stick", 0)
    dropAllOfThisExcept(Player, "minecraft:apple", 0)
    dropAllOfThisExcept(Player, wood, 0)
}
function roundAndMid(x) {
    if (x > 0) {
        return Math.floor(x) + 0.5
    } else if (x < 0) {
        return Math.ceil(x) - 0.5
    }
}

function getCurrentColumnFromIndex(i) {
    let columnLength = southSapling - northSapling
    let treesPerColumn = Math.floor(columnLength / saplingSpacing)
    let columnMinusRemainder = Math.floor(i / treesPerColumn)

    return columnMinusRemainder
}
function getCurrentRowFromIndex(i) {
    let columnLength = southSapling - northSapling
    let treesPerColumn = Math.floor(columnLength / saplingSpacing)
    return Math.floor((i % treesPerColumn))
}
function hasItem(basic, name, hotbar, dmg) {
    let inv = Player.openInventory()
    let slots = inv.getMap()

    if (hotbar == null) {
        hotbar = inv.getSelectedHotbarSlotIndex()
    }

    let slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()]
    let item = inv.getSlot(slot)
    let dura = item.getMaxDamage() - item.getDamage()
    if (item.getItemID() === name && (dmg === -1 || dura > dmg)) {
        inv.close()
        return true
    }

    for (let i = 0; i < 9; i++) {
        let slot = slots["hotbar"][i]
        let item = inv.getSlot(slot)
        let dura = item.getMaxDamage() - item.getDamage()
        if (item.getItemID() === name && (dmg == -1 || dura > dmg)) {
            inv.close()
            return true
        }
    }
    for (let i = 0; i < 36; i++) {
        let slot = slots["main"][i]
        if (slot) {
            let item = inv.getSlot(slot)
            dura = item.getMaxDamage() - item.getDamage()
            if (item.getItemID() === name && (dmg === -1 || dura > dmg)) {
                inv.close()
                return true
            }
        }
    }
    inv.close()
    return false
}
function getY() {
    return Player.getPlayer().getPos().y
}
function eatAsNeeded() {
    let foods = [
        "minecraft:baked_potato",
        "minecraft:carrot",
        "minecraft:melon_slice",
        "minecraft:bread",
        "minecraft:dried_kelp"
    ]// add food ids as needed :-)

    if (Player.getPlayer().getFoodLevel() < 18) {
        // Not regenerating food at this point
        // Eat until fed
        let hasFood = true
        KeyBind.keyBind("key.use", true)
        for (j = 0; j < foods.length; j++) {
            let item = foods[j]
            if (hasItem("", item, null, -1)) {
                pick(item, null, -1);
                break
            }
        }
        do {

            waitRealTick(16)
        } while (20 > Player.getPlayer().getFoodLevel())
        KeyBind.keyBind("key.use", false)
        if (!hasFood) {
            // If we don't have food, logout
            Chat.log('Out of food')
            logoutWithDiscordAlert("Logged out safely because of a lack of food", "safeLogout")
            KeyBind.keyBind("key.use", false)
        }
    }
}
let currentTree = GlobalVars.getInt("nebulaTreeBot-index")

if (currentTree == null) {
    GlobalVars.putInt("nebulaTreeBot-index", 1)
}

let cxAdd = Math.max(0, (getCurrentColumnFromIndex(currentTree) - 1) * saplingSpacing)
const startTime = new Date();
const sthours = startTime.getUTCHours();
const stmins = startTime.getUTCMinutes();
slog(`Running tree bot, offset ${cxAdd} blocks east at UTC: ${sthours}:${stmins}`)
slog("Current tree is no. " + GlobalVars.getInt("nebulaTreeBot-index"))
let safeWalkwayZ = northSapling - 4
if (isFirstSaplingSpacedOut) {
    safeWalkwayZ -= paneSpace
}
let addingCz = true
let screamingDebounce = false


for (let cx = westSapling + cxAdd; cx <= eastSapling; cx += saplingSpacing) {


    walkTo(Player, cx, safeWalkwayZ)
    let czAdd = Math.max(0, (getCurrentRowFromIndex(GlobalVars.getInt("nebulaTreeBot-index")) - 1)) * 3
    slog("Offset " + czAdd + " blocks south")
    for (let cz = northSapling; cz <= southSapling; cz += saplingSpacing) {
        eatAsNeeded()
        let bx = roundAndMid(cx)
        let bz = roundAndMid(cz)
        walkTo(Player, cx, cz - 4)
        // Attack this tree, starting with the leaves. The goal is to be one block ahead of the sapling since we can't walk into a tree.
        slog("Current tree is no. " + GlobalVars.getInt("nebulaTreeBot-index"))

        // Switch to sapling, since we don't want to break wood if that's what is infront of us
        slog("Breaking leaves of tree " + GlobalVars.getInt("nebulaTreeBot-index"))
        pick(sapling, 5, -1)
        Player.getPlayer().lookAt(0, 0)
        KeyBind.keyBind("key.attack", true)
        waitRealTick(Math.floor(6 * 6))
        KeyBind.keyBind("key.attack", false)

        // Check if there is a tree / sapling there
        slog("Verifying tree" + GlobalVars.getInt("nebulaTreeBot-index"))
        pick(sapling, 5, -1)
        Player.getPlayer().lookAt(bx, getY(), bz)
        let sapCount = countItems(Player, sapling) + 0
        Client.waitTick(2)
        KeyBind.keyBind("key.attack", true)
        Client.waitTick(4)
        KeyBind.keyBind("key.attack", false)
        Client.waitTick(2)
        KeyBind.keyBind("key.use", true)
        Client.waitTick(2)
        KeyBind.keyBind("key.use", false)
        Client.waitTick(2)
        if (countItems(Player, sapling) >= sapCount) { // If we have less saplings, 
            //We've used one tick to break the block here and replaced it on the next tick. This is an instabreakable block so it's probably a sapling and not wood, which means if we lose a sap to placing it
            // Then we should skip the tree
            // Grab an axe
            pick(axeType, 7, 10);

            // Break bottom wood
            slog("Sapling count before planting: " + sapCount + " current saplings: " + countItems(Player, sapling))
            Player.getPlayer().lookAt(bx, getY(), bz)
            KeyBind.keyBind("key.attack", true)

            waitRealTick(Math.floor(currentToolBreaktimeWood * 2.5))
            KeyBind.keyBind("key.attack", false)

            Client.waitTick(5)

            // Break top wood
            slog("Breaking top log of tree " + GlobalVars.getInt("nebulaTreeBot-index"))
            pickAxe(Player, 7, 10)
            Player.getPlayer().lookAt(bx, getY() + 1, bz)
            KeyBind.keyBind("key.attack", true)

            waitRealTick(Math.floor(currentToolBreaktimeWood * 2.15))
            KeyBind.keyBind("key.attack", false)

            Client.waitTick(5)

            // Walk under it
            slog("Breaking other logs of tree " + GlobalVars.getInt("nebulaTreeBot-index"))
            walkTo(Player, cx, cz)
            Player.getPlayer().lookAt(bx, getY() + 3, bz)
            KeyBind.keyBind("key.attack", true)
            Player.getPlayer().lookAt(bx, getY() + 3, bz)
            waitRealTick(Math.floor(currentToolBreaktimeWood * treeLength * 1.45))
            KeyBind.keyBind("key.attack", false)

            slog("Breaking other leaves of tree " + GlobalVars.getInt("nebulaTreeBot-index"))
            pick(sapling, 5, -1)
            Player.getPlayer().lookAt(0, 0)
            KeyBind.keyBind("key.attack", true)
            waitRealTick(Math.floor(6 * 24))
            KeyBind.keyBind("key.attack", false)

            // Replant sapling
            slog("Replanting tree" + GlobalVars.getInt("nebulaTreeBot-index"))
            pick(sapling, 5, -1)

            Player.getPlayer().lookAt(bx, getY() - 1, bz)
            Client.waitTick(3)
            KeyBind.keyBind("key.use", true)
            Client.waitTick(1)
            KeyBind.keyBind("key.use", false)
        } else {
            walkTo(Player, cx, cz)
        }
    }
    addingCz = false
    let throwDir = -130
    if (cx == eastSapling) {
        throwDir = 130
    }
    Player.getPlayer().lookAt(throwDir, 52)
    dropLoot()
    Client.waitTick(5)
    walkTo(Player, cx, safeWalkwayZ)
}

const endTime = new Date();
const enhours = endTime.getUTCHours();
const entmins = endTime.getUTCMinutes();
slog(`Broadcasting completed harvest and closing listeners`)

GlobalVars.remove("nebulaTreeBot-index")
Chat.say("/logout")
throw ("Hopefully this closes the listeners")
