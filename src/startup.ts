import { Config } from "config/Config";
import { HeroClass } from "content/constants/HeroClass";
import { PaladinProgression } from "content/class-progression/PaladinProgression";
import { OrbType } from "content/constants/OrbType";
import { Coords } from "systems/coords/Coords";
import { GameStateManager } from "systems/game-state/GameStateManager";
import { HeroManager } from "systems/hero-manager/HeroManager";
import { MinionFactory } from "systems/minion-factory/MinionFactory";
import { Orb, OrbConfig } from "systems/orb-resource-bar/Orb";
import { OrbFactory } from "systems/orb-resource-bar/OrbFactory";
import { ResourceBar } from "systems/orb-resource-bar/ResourceBar";
import { ResourceBarManager } from "systems/orb-resource-bar/ResourceBarManager";
import { RequirementTracker } from "systems/requirements/RequirementTracker";
import { UnitRequirement } from "systems/requirements/UnitRequirement";
import { TeamManager } from "systems/team-manager/TeamManager";
import { VoteDialogService } from "systems/vote-dialog-service/VoteDialogService";
import { OrbViewModel } from "ui/orbs/view-models/OrbViewModel";
import { ResourceBarViewModel } from "ui/orbs/view-models/ResourceBarViewModel";
import { GenerateOrbView } from "ui/orbs/views/OrbsView";
import { Camera, CameraSetup, Frame, MapPlayer, Rectangle, Timer, Unit } from "w3ts";
import { RequirementType } from "content/constants/RequirementType";
import { Bless } from "content/spells/paladin/Bless";
import { SkillManager } from "systems/skill-manager/SkillManager";
import { TextRendererFactory } from "systems/text-renderer/TextRendererFactory";
import { Rejuvenate } from "content/spells/paladin/Rejuvenate";
import { Purge } from "content/spells/paladin/Purge";
import { MinionSummoningService } from "systems/minion-summoning/MinionSummoningService";
import { EnumUnitService } from "systems/enum-service/EnumUnitService";
import { SummonMelee } from "content/spells/paladin/SummonMelee";
import { AbilityEventHandler } from "systems/ability-events/AbilityEventHandler";
import { AbilityEventProvider } from "systems/ability-events/AbilityEventProvider";
import { InterruptableService } from "systems/interruptable/InterruptableService";
import { MinionAiManager } from "systems/minion-ai/MinionAiManager";
import { Level, Log } from "systems/log/Log";
import { ArcaneTomeShop } from "content/shop/ArcaneTomeShop";
import { SpellcastingService } from "systems/progress-bars/SpellcastingService";
import { DummyAbilityFactory } from "systems/dummies/DummyAbilityFactory";
import { DummyUnitManager } from "systems/dummies/DummyUnitManager";
import { UnitTypeService } from "systems/classification-service/UnitTypeService";
import { ClassificationService } from "systems/classification-service/ClassificationService";
import { UnitType } from "content/constants/UnitType";
import { SummonRanged } from "content/spells/paladin/SummonRanged";
import { Invigorate } from "content/spells/paladin/Invigorate";
import { Endure } from "content/spells/paladin/Endure";
import { Justice } from "content/spells/paladin/Justice";
import { PlayerSelectionService } from "systems/enum-service/PlayerSelectionService";
import { CheatCommands } from "systems/cheat-commands/CheatCommands";

export function initializeGame() {

    let config = new Config();
    Log.Level = Level.Error;

    const players: MapPlayer[] = [
        MapPlayer.fromIndex(0)
    ];

    const teams = {
        0: { 
            id: 0,
            teamMembers: [MapPlayer.fromIndex(0)],
            teamOwner: MapPlayer.fromIndex(5),
        },
        1: { 
            id: 1,
            teamMembers: [MapPlayer.fromIndex(1)],
            teamOwner: MapPlayer.fromIndex(9),
        }
    };

    TextRendererFactory.Initialize(config.textRenderer);

    let orbRequirements: Record<OrbType, UnitRequirement> = {
        [OrbType.Blue]:         new UnitRequirement("blue", config.unitRequirementUnitTypes[OrbType.Blue]),
        [OrbType.Purple]:       new UnitRequirement("purple", config.unitRequirementUnitTypes[OrbType.Purple]),
        [OrbType.Red]:          new UnitRequirement("red", config.unitRequirementUnitTypes[OrbType.White]),
        [OrbType.White]:        new UnitRequirement("white", config.unitRequirementUnitTypes[OrbType.Red]),
        [OrbType.Summoning]:    new UnitRequirement("summ", config.unitRequirementUnitTypes[OrbType.Summoning]),
        [OrbType.Any]:          new UnitRequirement("any", config.unitRequirementUnitTypes[OrbType.Any]),
    };
    
    const requirementsTracker = new RequirementTracker<RequirementType>({
        [RequirementType.Blue]: orbRequirements[OrbType.Blue],
        [RequirementType.Purple]: orbRequirements[OrbType.Purple],
        [RequirementType.Red]: orbRequirements[OrbType.Red],
        [RequirementType.White]: orbRequirements[OrbType.White],
        [RequirementType.Summoning]: orbRequirements[OrbType.Summoning],
        [RequirementType.Mastery]: new UnitRequirement("", []),
        [RequirementType.DarkArtBlood]: new UnitRequirement("", []),
        [RequirementType.DarkArtUnholy]: new UnitRequirement("", []),
        [RequirementType.DarkArtNecromancy]: new UnitRequirement("", []),
    })

    for (let k of Object.keys(config.requirementUpgrades)) {
        let req = config.requirementUpgrades[k];
        requirementsTracker.Register(req[0], req[1]);
    }

    const orbFactory = new OrbFactory({ requirements: orbRequirements });
    const minionFactory = new MinionFactory(config.minionFactory);

    const interruptableService = new InterruptableService();
    const enumService = new EnumUnitService();
    const voteDialogService = new VoteDialogService();
    const classificationService = new ClassificationService<UnitType>();
    const unitTypeService = new UnitTypeService(config.unitTypeService, classificationService);

    const abilityEvent = new AbilityEventHandler();
    const abilityEventProvider = new AbilityEventProvider(abilityEvent, interruptableService);
    const resourceBarManager = new ResourceBarManager(orbFactory, config.resourceBarManager);
    const teamManager = new TeamManager(players, teams);
    const skillManager = new SkillManager();
    const dummyUnitManager = new DummyUnitManager(config.dummyUnitManager);

    const minionSummoningService = new MinionSummoningService(config.minionSummoning, minionFactory, enumService, teamManager, new MinionAiManager());
    const spellcastingService = new SpellcastingService(config.spellcastingService, interruptableService);
    const dummyAbilityFactory = new DummyAbilityFactory(dummyUnitManager);

    //#region Spells
    const abl = {
        rejuvenate: new Rejuvenate(config.rejuvenate, abilityEvent, resourceBarManager, spellcastingService, enumService),
        bless: new Bless(config.bless, abilityEvent, resourceBarManager, spellcastingService, enumService, dummyAbilityFactory),
        purge: new Purge(config.purge, abilityEvent, resourceBarManager, spellcastingService, enumService, dummyAbilityFactory, unitTypeService),
        invigorate: new Invigorate(config.invigorate, abilityEvent, resourceBarManager, spellcastingService, enumService, dummyAbilityFactory, unitTypeService),
        endure: new Endure(config.endure, abilityEvent, resourceBarManager, spellcastingService, enumService, dummyAbilityFactory),
        justice: new Justice(config.justice, abilityEvent, resourceBarManager, spellcastingService),
        
        summonMelee: new SummonMelee(config.summonMelee, abilityEvent, minionSummoningService, resourceBarManager),
        summonRanged: new SummonRanged(config.summonRanged, abilityEvent, minionSummoningService, resourceBarManager),
    }
    //#endregion

    // Shop
    const arcaneTomeShop = new ArcaneTomeShop(config.arcaneTomeShop, resourceBarManager);

    const heroManager = new HeroManager<HeroClass>(config.heroManagerConfig, {
        [HeroClass.Paladin]: u => new PaladinProgression(u, abl, resourceBarManager, skillManager),
        [HeroClass.Warlock]: u => new PaladinProgression(u, abl, resourceBarManager, skillManager),
        [HeroClass.Elementalist]: u => new PaladinProgression(u, abl, resourceBarManager, skillManager),
        [HeroClass.Inquisitor]: u => new PaladinProgression(u, abl, resourceBarManager, skillManager),
        [HeroClass.DeathKnight]: u => new PaladinProgression(u, abl, resourceBarManager, skillManager),
    });
    
    const gameStateManager = new GameStateManager(config.gameStateManager, heroManager, minionFactory, teamManager, resourceBarManager, voteDialogService, enumService);
    
    // UI
    let orbsView = GenerateOrbView(config.orbView, Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0));
    
    // Test
    {
        const selectionService = new PlayerSelectionService(players);
        const cheatCommands = new CheatCommands(enumService, players, teamManager, heroManager, selectionService, minionSummoningService);
        cheatCommands.init();

        let orbVm: OrbViewModel[] = [];
        for (let orbView of orbsView.orbs) {
            orbVm.push(new OrbViewModel(config.orbViewModelConfig, MapPlayer.fromIndex(0), orbView));
        }
        
        let rbVm = new ResourceBarViewModel(MapPlayer.fromIndex(0), orbsView, i =>
            new OrbViewModel(config.orbViewModelConfig, MapPlayer.fromIndex(0), orbsView.orbs[i]));
    
        resourceBarManager.OnCreate((owner, bar) => {
            rbVm.resourceBar = bar;
        });

        MapPlayer.fromIndex(0).setState(PLAYER_STATE_RESOURCE_LUMBER, 20);
        // let redResourceBar = rbVm.resourceBar = resourceBarManager.Get(0);
    
        // let orb = redResourceBar.AddOrb(OrbType.Blue);
        // redResourceBar.AddOrb(OrbType.Purple);
        // redResourceBar.AddOrb(OrbType.White);
        
        // new Timer().start(7, true, () => {
        //     redResourceBar.Consume([OrbType.Blue, OrbType.Red])
        // });
    
        // let x = true;
        // new Timer().start(4, true, () => {
        //     let redResourceBar = rbVm.resourceBar = resourceBarManager.Get(0);
        //     if (x) redResourceBar.AddOrb(OrbType.Summoning);
        //     // else redResourceBar.AddOrb(<OrbType>(math.floor(math.random(0, 4))));
        //     else redResourceBar.AddOrb(<OrbType>(math.floor(math.random(0, 1) + 0.5)*2));
        //     x = !x;
        // });
    }

    // Cleanup
    {
        let cleanupUnits = enumService.EnumUnitsInRect(Rectangle.getWorldBounds(), t => t.typeId == FourCC('h01L'));
        for (let u of cleanupUnits) {
            u.destroy();
        }
    }
}