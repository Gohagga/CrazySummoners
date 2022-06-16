import { OrbType } from "content/constants/OrbType";
import { BlessAbilityData } from "content/spells/paladin/Bless";
import { PurgeAbilityData } from "content/spells/paladin/Purge";
import { RejuvenateAbilityData } from "content/spells/paladin/Rejuvenation";
import { SummonMeleeAbilityData } from "content/spells/paladin/SummonMelee";
import { Coords } from "systems/coords/Coords";
import { GameStateManagerConfig } from "systems/game-state/GameStateManager";
import { HeroDefinition, HeroManagerConfig } from "systems/hero-manager/HeroManager";
import { MinionFactoryConfig } from "systems/minion-factory/MinionFactory";
import { MinionSummoningServiceConfig } from "systems/minion-summoning/MinionSummoningService";
import { OrbConfig } from "systems/orb-resource-bar/Orb";
import { ResourceBarManagerConfig } from "systems/orb-resource-bar/ResourceBarManager";
import { TextRendererFactoryConfig } from "systems/text-renderer/TextRendererFactory";
import { OrbViewModelConfig } from "ui/orbs/view-models/OrbViewModel";
import { IOrbViewConfig } from "ui/orbs/views/OrbsView";
import { CameraSetup } from "w3ts";
import { OrderId } from "w3ts/globals/order";
import { HeroClass } from "../content/constants/HeroClass";
import { RequirementType as Req } from '../content/constants/RequirementType'

const iconPath = "ReplaceableTextures/CommandButtons";

export class Config {
    
    //#region UI
    orbView: IOrbViewConfig = {
        ballCount: 12,
        window: {
            backgroundTexture: "",
            x: 0.215,
            y: 0.15,
            height: 0.1,
            width: 0.1,
        },
        ball: {
            backgroundTexture: "BlackBall.blp",
            foregroundTexture: "BlueBall.blp",
            height: 0.028,
            width: 0.028,
            iconScale: 1.1,
            padding: 0.003,
        }
    }

    orbViewModelConfig: OrbViewModelConfig = {
        emptySlotBackgroundTexture: "BlackBall.blp",
        orbTypeData: {
            [OrbType.Blue]: {
                iconEnabled: iconPath + "/BTNBlueBall.blp",
                iconDisabled: iconPath + "Disabled/DISBTNBlueBall.blp",
                tooltip: "Blue Orb",
            },
            [OrbType.Purple]: {
                iconEnabled: iconPath + "/BTNPurpleBall.blp",
                iconDisabled: iconPath + "Disabled/DISBTNPurpleBall.blp",
                tooltip: "Purple Orb",
            },
            [OrbType.Red]: {
                iconEnabled: iconPath + "/BTNRedBall.blp",
                iconDisabled: iconPath + "Disabled/DISBTNRedBall.blp",
                tooltip: "Red Orb",
            },
            [OrbType.White]: {
                iconEnabled: iconPath + "/BTNWhiteBall.blp",
                iconDisabled: iconPath + "Disabled/DISBTNWhiteBall.blp",
                tooltip: "White Orb",
            },
            [OrbType.Summoning]: {
                iconEnabled: iconPath + "/BTNSummoningBall.blp",
                iconDisabled: iconPath + "Disabled/DISBTNSummoningBall.blp",
                tooltip: "Summoning Orb",
            }
        }
    }

    //#endregion

    gameStateManager: GameStateManagerConfig = {
        balanceSetChoices: {
            "balance1": { text: 'Balance 1', hotkey: 1 },
            "balance2": { text: 'Balance 2', hotkey: 2 },
        },
        unitBalanceSetChoices: {
            "balance1": { text: 'Balance 1', hotkey: 1 },
            "balance2": { text: 'Balance 2', hotkey: 2 },
        },
        mapChoices: {
            "map1": {
                teamStartingPosition: { 0: Coords.fromWc3Unit(gg_unit_h01L_0017) , 1: Coords.fromWc3Unit(gg_unit_h01L_0018) },
                teamCamera: { 0: CameraSetup.fromHandle(gg_cam_GameCameraH1), 1: CameraSetup.fromHandle(gg_cam_GameCameraH2) },
            },
            "map2": {
                teamStartingPosition: { 0: Coords.fromWc3Unit(gg_unit_h01L_0017) , 1: Coords.fromWc3Unit(gg_unit_h01L_0018) },
                teamCamera: { 0: CameraSetup.fromHandle(gg_cam_GameCameraH1), 1: CameraSetup.fromHandle(gg_cam_GameCameraH2) },
            },
        },
        teamDamageRegion: {
            0: [gg_rct_Red_Damage_Line],
            1: [gg_rct_Blue_Damage_Line],
        }
    }

    heroManagerConfig: HeroManagerConfig<HeroClass> = {
        heroShopUnitTypeCode: 'e000',
        heroDefs: {
            [HeroClass.Paladin]: {
                name: 'Paladin',
                unitTypeCode: 'HPAL'
            },
            [HeroClass.Warlock]: {
                name: 'Warlock',
                unitTypeCode: 'HPL3'
            },
            [HeroClass.Elementalist]: {
                name: 'Elementalist',
                unitTypeCode: 'HELE'
            },
            [HeroClass.Inquisitor]: {
                name: 'Inquisitor',
                unitTypeCode: 'H00D'
            },
            [HeroClass.DeathKnight]: {
                name: 'Death Knight',
                unitTypeCode: 'H00H'
            }
        }
    }

    unitRequirementUnitTypes: Record<OrbType, string[]> = {
        [OrbType.Blue]:         ['h00Z', 'h010', 'h011', 'h012'],
        [OrbType.White]:        ['h017', 'h018', 'h019', 'h01A'],
        [OrbType.Purple]:       ['h01B', 'h01C', 'h01D', 'h01E'],
        [OrbType.Red]:          ['h016', 'h014', 'h015', 'h013'],
        [OrbType.Summoning]:    ['h01F', 'h01G', 'h01H', 'h01I'],
        [OrbType.Any]:          [],
    }

    requirementUpgrades: Record<string, [string, Req[]]> = {
        
        ['R00B']:       ['R00B', [Req.White, Req.White, Req.Red]],
        ['R00D']:       ['R00D', [Req.Summoning, Req.Summoning]],
        ['R016']:       ['R016', [Req.Summoning]],
        ['R015']:       ['R015', [Req.White, Req.White, Req.White]],
        ['R014']:       ['R014', [Req.White, Req.White, Req.Blue]],
        ['R013']:       ['R013', [Req.White, Req.White, Req.Purple]],
        ['R012']:       ['R012', [Req.Purple, Req.Red]],
        ['R011']:       ['R011', [Req.White, Req.White, Req.Red, Req.Blue, Req.Mastery, Req.Mastery]],
        ['R010']:       ['R010', [Req.White, Req.White, Req.Blue, Req.Purple, Req.Mastery, Req.Mastery]],
        ['R00Z']:       ['R00Z', [Req.White, Req.White, Req.Red, Req.Purple, Req.Mastery, Req.Mastery]],
        ['R00Y']:       ['R00Y', [Req.Purple, Req.Red]],
        ['R00X']:       ['R00X', [Req.Purple, Req.Summoning]],
        ['R00W']:       ['R00W', [Req.Blue]],
        ['R00V']:       ['R00V', [Req.Purple, Req.Red]],
        ['R00U']:       ['R00U', [Req.Purple, Req.Purple, Req.Red, Req.Summoning]],
        ['R00T']:       ['R00T', [Req.Purple, Req.Purple, Req.Blue, Req.Red]],
        ['R018']:       ['R018', [Req.Purple, Req.Purple, Req.Red, Req.Red, Req.Mastery, Req.Mastery]],
        ['R00R']:       ['R00R', [Req.Purple, Req.Red, Req.Summoning, Req.Mastery, Req.Mastery]],
        ['R00Q']:       ['R00Q', [Req.Purple, Req.Purple, Req.Blue, Req.Mastery, Req.Mastery]],
        ['Ritual']:     ['R00J', [Req.Purple, Req.Purple, Req.Red]],

        ['Abom']:       ['R00P', [Req.Red, Req.Summoning]],
        ['Leech']:      ['R00O', [Req.Red, Req.Red, Req.Summoning,                 Req.DarkArtBlood]],
        ['Volley']:     ['R00H', [Req.Red, Req.Red, Req.Blue, Req.Purple,         Req.DarkArtUnholy]],
        ['Embrace']:    ['R00L', [Req.Red, Req.Blue,                             Req.DarkArtNecromancy]],
        ['CorrBlood']:  ['R00M', [Req.Red, Req.Red,                            Req.DarkArtBlood]],
        ['Amz']:        ['R00K', [Req.Red, Req.Blue, Req.Blue,                       Req.DarkArtUnholy]],
        ['Dnd']:        ['R00N', [Req.Red, Req.Purple, Req.Blue,                     Req.DarkArtNecromancy]],
        ['Boon']:       ['R00I', [Req.Red, Req.Red, Req.Purple,                     Req.DarkArtBlood]],
        ['curse']:      ['R00F', [Req.Red, Req.Red, Req.Purple,                    Req.DarkArtUnholy]],
        ['Army']:       ['R00G', [Req.Red, Req.Red, Req.Blue, Req.Purple,           Req.DarkArtNecromancy]],
        
        ['Fireball']:       ['R00E', [Req.Red, Req.Red]],
        ['Ice Blast']:      ['R017', [Req.Blue, Req.Red]],
        ['Conductivity']:   ['R00C', [Req.Purple]],
        ['Flame Barrage']:  ['R00S', [Req.Red, Req.Blue]],
        ['Ray of Cold']:    ['R01D', [Req.Blue, Req.Purple]],
        ['Living Curr']:    ['R01E', [Req.Purple, Req.Purple]],
        ['Inferno']:        ['R01F', [Req.Red, Req.Red, Req.Purple]],
        ['Frost Nova']:     ['R01G', [Req.Blue, Req.Blue, Req.Red]],
        // 
        // [FourCC('R01H')]: [Req.Red, Req.Blue],
        // // 
        // [FourCC('R01I')]: [Req.Red, Req.Blue],
        // // 
        // [FourCC('R01J')]: [Req.Red, Req.Blue],



        ['Dark Arts Blood']:    ['R01A', [Req.DarkArtBlood]],
        ['Dark Arts Unholy']:   ['R01B', [Req.DarkArtUnholy]],
        ['Dark Arts Necro']:    ['R019', [Req.DarkArtNecromancy]],
    }

    textRenderer: TextRendererFactoryConfig = {
        colors: {
            "r": "|cffff8080",
            "lb": "|cff80ffff",
            "acc": "|cffffd9b3",
            "b": "|cff8a8aff",
            "chill": "|cff00cac5",
            "red": "|cffff6c6c",
            "blu": "|cff8a8aff",
        },
        keywords: {
        }
    }

    minionSummoning: MinionSummoningServiceConfig = {
        summoningCrystals: [
            {
                unit: gg_unit_h001_0015,
                region: gg_rct_CrystalRedA1,
                limit: 8,
                destination: gg_unit_h002_0013,
            }, {
                unit: gg_unit_h001_0004,
                region: gg_rct_CrystalRedA2,
                limit: 8,
                destination: gg_unit_h002_0012,
            }, {
                unit: gg_unit_h001_0006,
                region: gg_rct_CrystalRedA3,
                limit: 8,
                destination: gg_unit_h002_0011,
            }, {
                unit: gg_unit_h001_0008,
                region: gg_rct_CrystalRedA4,
                limit: 8,
                destination: gg_unit_h002_0010,
            }, {
                unit: gg_unit_h001_0014,
                region: gg_rct_CrystalRedA5,
                limit: 8,
                destination: gg_unit_h002_0009,
            },
            
            {
                unit: gg_unit_h002_0013,
                region: gg_rct_CrystalBlueA1,
                limit: 8,
                destination: gg_unit_h001_0015,
            }, {
                unit: gg_unit_h002_0012,
                region: gg_rct_CrystalBlueA2,
                limit: 8,
                destination: gg_unit_h001_0004,
            }, {
                unit: gg_unit_h002_0011,
                region: gg_rct_CrystalBlueA3,
                limit: 8,
                destination: gg_unit_h001_0006,
            }, {
                unit: gg_unit_h002_0010,
                region: gg_rct_CrystalBlueA4,
                limit: 8,
                destination: gg_unit_h002_0010,
            }, {
                unit: gg_unit_h002_0009,
                region: gg_rct_CrystalBlueA5,
                limit: 8,
                destination: gg_unit_h001_0014,
            }
        ]
    }

    resourceBarManager: ResourceBarManagerConfig = {
        gameBalance: {
            'balance1': {
                coloredOrbCooldown: 25,
                summoningOrbCooldown: 25,
            }
        }
    }

    minionFactory: MinionFactoryConfig = {
        gameBalance: {
            'balance1': {
                maxLevel: 10,
                maxEffectiveHp: 2500,
                maxToMinRelativeValue: 25/15,
                minEffectiveHp: 250,
                secondsToDie: 25,
            }
        },
        unitBalance: {
            'balance1': {
                unitTypeStatWeight: {
                    'hF00': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF01': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF02': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF03': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF04': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF05': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF06': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF07': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF08': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                    'hF09': {
                        attack: {
                            diceTweaks: [13, 23, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.5,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.02,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.5,
                        offenseRatio: 0.5,
                    },
                }
            }
        }
    }

    //#region Spells

    bless: BlessAbilityData = {
        abilityCode: 'AP02',
        orderId: OrderId.Flamestrike,
        orbCost: [OrbType.White, OrbType.White, OrbType.Red],
        name: '|cffffff80Bless|r - 1',
        tooltip: '',
    }

    rejuvenate: RejuvenateAbilityData = {
        abilityCode: 'AP01',
        orderId: OrderId.Rejuvination,
        orbCost: [OrbType.White, OrbType.White, OrbType.White],
        name: '|cffffff80Rejuvenate|r - 1',
        tooltip: '',
    }

    purge: PurgeAbilityData = {
        abilityCode: 'AP03',
        orderId: OrderId.Rejuvination,
        orbCost: [OrbType.White, OrbType.White, OrbType.White],
        name: '|cffffff80Rejuvenate|r - 1',
        tooltip: '',
    }
    
    summonMelee: SummonMeleeAbilityData = {
        abilityCode: 'A001',
        orderId: OrderId.Acidbomb,
        orbCost: [OrbType.Summoning],
        name: 'Summon Melee',
        tooltip: '',
        levelSummonedUnitTypeId: {
            1: 'hF00',
            2: 'hF01',
            3: 'hF02',
            4: 'hF03',
            5: 'hF04',
            6: 'hF05',
            7: 'hF06',
            8: 'hF07',
            9: 'hF08',
            10: 'hF09',
        }
    }

    //#endregion
}
