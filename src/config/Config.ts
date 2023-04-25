import { Models } from "content/constants/Models";
import { OrbType } from "content/constants/OrbType";
import { Units } from "content/constants/Units";
import { UnitType } from "content/constants/UnitType";
import { Zones } from "content/constants/Zones";
import { ArcaneTomeShopConfig } from "content/shop/ArcaneTomeShop";
import { BlessAbilityData } from "content/spells/paladin/Bless";
import { EndureAbilityData } from "content/spells/paladin/Endure";
import { InvigorateAbilityData } from "content/spells/paladin/Invigorate";
import { JusticeAbilityData } from "content/spells/paladin/Justice";
import { PurgeAbilityData } from "content/spells/paladin/Purge";
import { RejuvenateAbilityData } from "content/spells/paladin/Rejuvenate";
import { SummonMeleeAbilityData } from "content/spells/paladin/SummonMelee";
import { SummonRangedAbilityData } from "content/spells/paladin/SummonRanged";
import { UnitTypeServiceConfig } from "systems/classification-service/UnitTypeService";
import { Coords } from "systems/coords/Coords";
import { DummyUnitManagerConfig } from "systems/dummies/DummyUnitManager";
import { GameStateManagerConfig } from "systems/game-state/GameStateManager";
import { HeroDefinition, HeroManagerConfig } from "systems/hero-manager/HeroManager";
import { MinionFactoryConfig } from "systems/minion-factory/MinionFactory";
import { MinionSummoningServiceConfig } from "systems/minion-summoning/MinionSummoningService";
import { OrbConfig } from "systems/orb-resource-bar/Orb";
import { ResourceBarManagerConfig } from "systems/orb-resource-bar/ResourceBarManager";
import { SpellcastingServiceConfig } from "systems/progress-bars/SpellcastingService";
import { TextRendererFactoryConfig } from "systems/text-renderer/TextRendererFactory";
import { OrbViewModelConfig } from "ui/orbs/view-models/OrbViewModel";
import { IOrbViewConfig } from "ui/orbs/views/OrbsView";
import { CameraSetup } from "w3ts";
import { OrderId } from "w3ts/globals/order";
import { HeroClass } from "../content/constants/HeroClass";
import { RequirementType as Req } from '../content/constants/RequirementType'
import { RedemptionAbilityData } from "content/spells/paladin/Redemption";
import { GameBalanceId, UnitBalanceId } from "content/constants/BalanceIds";
import { PaladinMasteryAbilityData } from "content/spells/paladin/PaladinMastery";
import { GuardianAngelAbilityData } from "content/spells/paladin/GuardianAngel";
import { ExorcismAbilityData } from "content/spells/paladin/Exorcism";
import { WhitePowerAbilityData } from "content/spells/paladin/WhitePower";
import { PerseveranceAbilityData } from "content/spells/paladin/Perseverance";

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
                iconEnabled: iconPath + "/BTNSummoningBall2.blp",
                iconDisabled: iconPath + "Disabled/DISBTNSummoningBall.blp",
                tooltip: "Summoning Orb",
            }
        }
    }

    //#endregion

    gameStateManager: GameStateManagerConfig = {
        balanceSetChoices: {
            [GameBalanceId.Alpha1]: { text: 'Alpha1', hotkey: 1 },
            // "balance2": { text: 'Balance 2', hotkey: 2 },
        },
        unitBalanceSetChoices: {
            [UnitBalanceId.Alpha1]: { text: 'Alpha1', hotkey: 1 },
            // "balance2": { text: 'Balance 2', hotkey: 2 },
        },
        mapChoices: {
            "map1": {
                name: "Map 1",
                teamStartingPosition: { 0: Coords.fromWc3Unit(gg_unit_h01L_0017) , 1: Coords.fromWc3Unit(gg_unit_h01L_0018) },
                teamCamera: { 0: CameraSetup.fromHandle(gg_cam_GameCameraH1), 1: CameraSetup.fromHandle(gg_cam_GameCameraH2) },
                visibility: [gg_rct_PlayArea],
                playArea: gg_rct_Battleground,
                zoneRegions: { 
                    [Zones.Lane1]: { rectangles: [gg_rct_Lane_1], circles: [] },
                    [Zones.Lane2]: { rectangles: [gg_rct_Lane_2], circles: [] },
                    [Zones.Lane3]: { rectangles: [gg_rct_Lane_3], circles: [] },
                    [Zones.Lane4]: { rectangles: [gg_rct_Lane_4], circles: [] },
                    [Zones.Lane5]: { rectangles: [gg_rct_Lane_5], circles: [] },
                    [Zones.Battleground]: { rectangles: [gg_rct_Battleground], circles: [] },
                },
                zoneCrystals: {
                    [Zones.Lane1]: [gg_unit_h001_0014, gg_unit_h002_0009],
                    [Zones.Lane2]: [gg_unit_h001_0008, gg_unit_h002_0010],
                    [Zones.Lane3]: [gg_unit_h001_0006, gg_unit_h002_0011],
                    [Zones.Lane4]: [gg_unit_h001_0004, gg_unit_h002_0012],
                    [Zones.Lane5]: [gg_unit_h001_0015, gg_unit_h002_0013],
                    [Zones.Battleground]: [],
                }
            },
            // "map2": {
            //     name: "Map 2",
            //     teamStartingPosition: { 0: Coords.fromWc3Unit(gg_unit_h01L_0017) , 1: Coords.fromWc3Unit(gg_unit_h01L_0018) },
            //     teamCamera: { 0: CameraSetup.fromHandle(gg_cam_GameCameraH1), 1: CameraSetup.fromHandle(gg_cam_GameCameraH2) },
            //     visibility: [gg_rct_PlayArea],
            //     playArea: gg_rct_Battleground,
            //     laneZones: { 
            //         [Zones.Lane1]: { rectangles: [gg_rct_Lane_1], circles: [] },
            //         [Zones.Lane2]: { rectangles: [gg_rct_Lane_2], circles: [] },
            //         [Zones.Lane3]: { rectangles: [gg_rct_Lane_3], circles: [] },
            //         [Zones.Lane4]: { rectangles: [gg_rct_Lane_4], circles: [] },
            //         [Zones.Lane5]: { rectangles: [gg_rct_Lane_5], circles: [] },
            //     },
            // },
        },
        teamDamageRegion: {
            0: [gg_rct_Red_Damage_Line],
            1: [gg_rct_Blue_Damage_Line],
        },
        playingBoard: [
            gg_rct_Battleground
        ]
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
        ['R011']:       ['R011', [Req.White, Req.White, Req.Red, Req.Blue, /*Req.Mastery, Req.Mastery*/]],
        ['R010']:       ['R010', [Req.White, Req.White, Req.Blue, Req.Purple, /*Req.Mastery, Req.Mastery*/]],
        ['R00Z']:       ['R00Z', [Req.White, Req.White, Req.Red, Req.Purple, /*Req.Mastery, Req.Mastery*/]],
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

    spellcastingService: SpellcastingServiceConfig = {
        defaultHeight: 250,
        model: 'Progressbar_01.mdx',
        queueTreshold: 0.5,
        size: 2.5,
        updatePeriod: 0.03,
    }

    dummyUnitManager: DummyUnitManagerConfig = {
        dummyUnitCodeId: 'nDUM',
        dummyUnitOwnerPlayerId: PLAYER_NEUTRAL_PASSIVE
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
                destination: gg_unit_h001_0008,
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
            [GameBalanceId.Alpha1]: {
                coloredOrbCooldown: 25,
                summoningOrbCooldown: 25,
                coloredMaxCount: 12,
                summoningMaxCount: 6,
            }
        }
    }

    minionFactory: MinionFactoryConfig = {
        gameBalance: {
            [GameBalanceId.Alpha1]: {
                maxLevel: 10,
                maxEffectiveHp: 2500,
                maxToMinRelativeValue: 25/15,
                minEffectiveHp: 250,
                secondsToDie: 25,
            }
        },
        unitBalance: {
            [UnitBalanceId.Alpha1]: {
                unitTypeStatWeight: {
                    [Units.Woodcutter]: {
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
                    [Units.Militia]: {
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
                    [Units.Enforcer]: {
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
                    [Units.Footman]: {
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
                    [Units.Swordsman]: {
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
                    [Units.Captain]: {
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
                    [Units.HorsemanKnight]: {
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
                    [Units.Guardian]: {
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
                    [Units.Templar]: {
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
                    [Units.HolyKnight]: {
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
                    [Units.Peasant]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.Rogue]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.SpearThrower]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.Archer]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.Ranger]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.Rifleman]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.Sharpshooter]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.MortarTeam]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.FlyingMachine]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.GryphonRider]: {
                        attack: {
                            diceTweaks: [13, 25, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.2,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0.1,
                        },
                        defenseRatio: 0.37,
                        offenseRatio: 0.63,
                    },
                    [Units.CacoDemon]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.EvilEye]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Gargoyle]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.VileTemptress]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Hydralisk]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Destroyer]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Ocula]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.DemonLord]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.EredarSorcerer]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Overfiend]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Wig]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.FelHound]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.ClawDevil]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.FelGuard]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.FacelessOne]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.Oni]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.DemonSlasher]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.DemonBlademaster]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.DoomGuard]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                    [Units.PitLord]: {
                        attack: {
                            diceTweaks: [13, 26, 0.2],
                            dpsVariation: 0.3,
                            speed: 1.4,
                            targetsCount: 1,
                            targetsMultiplier: 1
                        },
                        defense: {
                            armorGrowth: 0.01,
                            armorRatio: 0,
                        },
                        defenseRatio: 0.45,
                        offenseRatio: 0.55,
                    },
                }
            }
        },
        summonLevelAbilityCode: 'ALVL'
    }

    unitTypeService: UnitTypeServiceConfig = {
        unitTypeClass: {
            [Units.Woodcutter]:          UnitType.Human,
            [Units.Militia]:             UnitType.Human,
            [Units.Enforcer]:            UnitType.Human,
            [Units.Footman]:             UnitType.Human,
            [Units.Swordsman]:           UnitType.Human,
            [Units.Captain]:             UnitType.Human,
            [Units.HorsemanKnight]:      UnitType.Human,
            [Units.Guardian]:            UnitType.Human,
            [Units.Templar]:             UnitType.Human,
            [Units.HolyKnight]:          UnitType.Human,
            [Units.Peasant]:             UnitType.Human,
            [Units.Rogue]:               UnitType.Human,
            [Units.SpearThrower]:        UnitType.Human,
            [Units.Archer]:              UnitType.Human,
            [Units.Ranger]:              UnitType.Human,
            [Units.Rifleman]:            UnitType.Human,
            [Units.Sharpshooter]:        UnitType.Human,
            [Units.MortarTeam]:          UnitType.Human,
            [Units.FlyingMachine]:       UnitType.Human,
            [Units.GryphonRider]:        UnitType.Human,

            [Units.CacoDemon]:           UnitType.Demon,
            [Units.EvilEye]:             UnitType.Demon,
            [Units.Gargoyle]:            UnitType.Demon,
            [Units.VileTemptress]:       UnitType.Demon,
            [Units.Hydralisk]:           UnitType.Demon,
            [Units.Destroyer]:           UnitType.Demon,
            [Units.Ocula]:               UnitType.Demon,
            [Units.DemonLord]:           UnitType.Demon,
            [Units.EredarSorcerer]:      UnitType.Demon,
            [Units.Overfiend]:           UnitType.Demon,
            [Units.Wig]:                 UnitType.Demon,
            [Units.FelHound]:            UnitType.Demon,
            [Units.ClawDevil]:           UnitType.Demon,
            [Units.FelGuard]:            UnitType.Demon,
            [Units.FacelessOne]:         UnitType.Demon,
            [Units.Oni]:                 UnitType.Demon,
            [Units.DemonSlasher]:        UnitType.Demon,
            [Units.DemonBlademaster]:    UnitType.Demon,
            [Units.DoomGuard]:           UnitType.Demon,
            [Units.PitLord]:             UnitType.Demon,
        }
    }

    //#region Spells

    bless: BlessAbilityData = {
        abilityCode: 'AP02',
        orderId: OrderId.Flamestrike,
        orbCost: [OrbType.White, OrbType.White, OrbType.Red],
        name: '|cffffff80Bless|r - 1',
        tooltip: '',
        castSfx: 'DeterminationCastAnimMajor.mdl',
        dummyBless: {
            orderId: OrderId.Innerfire,
            spellCodeId: 'A007',
            buffCodeId: 'BP02',
        }
    }

    rejuvenate: RejuvenateAbilityData = {
        abilityCode: 'AP01',
        orderId: OrderId.Parasite,
        orbCost: [OrbType.White, OrbType.White, OrbType.White],
        name: '|cffffff80Rejuvenate|r - 1',
        tooltip: '',
        castSfx: Models.CastRestoration,
        healSfxModel: 'Abilities/Spells/Demon/DarkPortal/DarkPortalTarget.mdl',
    }

    purge: PurgeAbilityData = {
        abilityCode: 'AP03',
        orderId: OrderId.Rejuvination,
        orbCost: [OrbType.White, OrbType.White, OrbType.White],
        name: '|cffffff80Purge|r - 1',
        tooltip: '',
        castSfx: Models.CastRepentance,
        damageSfxModel: 'Abilities/Spells/Human/HolyBolt/HolyBoltSpecialArt.mdl',
        effectSfxModel: 'SingularityOrange.mdl',
        dummyPurge: {
            orderId: OrderId.Dispel,
            spellCodeId: 'A03C'
        }
    }

    invigorate: InvigorateAbilityData = {
        abilityCode: 'AP04',
        orderId: OrderId.Phaseshift,
        orbCost: [OrbType.White, OrbType.White, OrbType.White],
        name: '|cffffff80Invigorate|r - 1',
        tooltip: '',
        castSfx: Models.CastRestoration,
        // damageSfxModel: 'Abilities/Spells/Human/HolyBolt/HolyBoltSpecialArt.mdl',
        // effectSfxModel: 'SingularityOrange.mdl',
        dummyInvigorate: {
            orderId: OrderId.Roar,
            spellCodeId: 'A005'
        }
    }

    endure: EndureAbilityData = {
        abilityCode: 'AP05',
        orderId: OrderId.Earthquake,
        orbCost: [OrbType.White, OrbType.White, OrbType.Purple],
        name: '|cffffff80Endure|r - 1',
        tooltip: '',
        castSfx: Models.CastDetermination,
        // damageSfxModel: 'Abilities/Spells/Human/HolyBolt/HolyBoltSpecialArt.mdl',
        effectSfxModel: 'Abilities\\Spells\\NightElf\\Taunt\\TauntCaster.mdl',
        dummyEndure: {
            orderId: OrderId.Frostarmor,
            spellCodeId: 'A00B'
        }
    }

    justice: JusticeAbilityData = {
        abilityCode: 'AP06',
        orderId: OrderId.Phaseshiftoff,
        orbCost: [OrbType.Purple, OrbType.Red],
        name: '|cffffff80Justice|r - 1',
        tooltip: '',
        castSfx: Models.CastRepentance,
        damageSfxModel: 'StormfallOrange.mdl',
    }

    redemption: RedemptionAbilityData = {
        abilityCode: 'AP08',
        orderId: OrderId.Phaseshifton,
        orbCost: [OrbType.White, OrbType.White, OrbType.Red, OrbType.Blue],
        name: '|cffffff80Redemption|r - 1',
        tooltip: '',
        castSfx: Models.CastRestoration,
        healSfx: 'Abilities\\Spells\\Human\\Resurrect\\ResurrectCaster.mdl',
        resurrectSfx: 'Abilities\\Spells\\Human\\Resurrect\\ResurrectCaster.mdl'
    }

    guardianAngel: GuardianAngelAbilityData = {
        abilityCode: 'AP09',
        orderId: OrderId.Phoenixmorph,
        orbCost: [OrbType.White, OrbType.White, OrbType.Blue, OrbType.Purple],
        name: '|cffffff80Guardian Angel|r - 1',
        tooltip: '',
        castSfx: Models.CastDetermination,
        effectSfx: 'Abilities\\Spells\\Human\\Resurrect\\ResurrectCaster.mdl',
        auraArmorCodeId: 'A004',
        auraArmorBuffCodeId: 'B005',
    }

    exorcism: ExorcismAbilityData = {
        abilityCode: 'AP07',
        orderId: OrderId.Poisonarrows,
        orbCost: [OrbType.White, OrbType.White, OrbType.Red, OrbType.Purple],
        name: '|cffffff80Exorcism|r - 1',
        tooltip: '',
        castSfx: Models.CastRepentance,
        killSfx: 'Abilities\\Spells\\Human\\DivineShield\\DivineShieldTarget.mdl',
        damageSfx: 'Abilities\\Spells\\Human\\Resurrect\\ResurrectTarget.mdl',
        damageTickDuration: 1,
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

    summonRanged: SummonRangedAbilityData = {
        abilityCode: 'A002',
        orderId: OrderId.Acolyteharvest,
        orbCost: [OrbType.Summoning],
        name: 'Summon Ranged',
        tooltip: '',
        levelSummonedUnitTypeId: {
            1: 'hR00',
            2: 'hR01',
            3: 'hR02',
            4: 'hR03',
            5: 'hR04',
            6: 'hR05',
            7: 'hR06',
            8: 'hR07',
            9: 'hR08',
            10: 'hR09',
        }
    }

    whitePower: WhitePowerAbilityData = {
        abilityCode: "A00T",
        orderId: OrderId.Whirlwind,
        orbCost: [],
        name: "White Power",
        whitePowerStackItemCodeId: "I00F",
    }

    perseverance: PerseveranceAbilityData = {
        abilityCode: "A014",
        orderId: OrderId.Preservation,
        orbCost: [],
        name: "Perseverance",
        auraCodeId: "A013",
    }

    paladinMastery: PaladinMasteryAbilityData = {
        abilityCode: 'A00F',
        chooseMasterySpellbookCodeId: 'APMB',
        choiceSpellCodeIds: {
            restoration: 'A00A',
            determination: 'A003',
            repentance: 'A009',
        },
        masteryPassiveCodeIds: {
            restoration: 'A00E',
            determination: 'A00C',
            repentance: 'A00D',
        },
        name: "",
        orderId: 0
    }
    
    //#endregion

    arcaneTomeShop: ArcaneTomeShopConfig = {
        soldItemCodeGainedOrbType: {
            'IB0B': OrbType.Blue,
            'IB0R': OrbType.Red,
            'IB0W': OrbType.White,
            'IB0P': OrbType.Purple,
            'IB0S': OrbType.Summoning,
        }
    };
}
