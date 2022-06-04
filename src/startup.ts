import { Config } from "config/Config";
import { HeroClass } from "config/HeroClass";
import { RequirementType } from "config/RequirementType";
import { PaladinProgression } from "content/class-progression/PaladinProgression";
import { OrbType } from "content/orbs/OrbType";
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
import { Camera, CameraSetup, Frame, MapPlayer, Timer } from "w3ts";

export function initializeGame() {

    let config = new Config();

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

    const orbFactory = new OrbFactory({
        requirements: orbRequirements
    });
    const resourceBarManager = new ResourceBarManager(orbFactory);

    let orbsView = GenerateOrbView(config.orbView, Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0));

    const players: MapPlayer[] = [
        MapPlayer.fromIndex(0)
    ];

    const heroManager = new HeroManager<HeroClass>(config.heroManagerConfig, {
        [HeroClass.Paladin]: u => new PaladinProgression(u),
        [HeroClass.Warlock]: u => new PaladinProgression(u),
        [HeroClass.Elementalist]: u => new PaladinProgression(u),
        [HeroClass.Inquisitor]: u => new PaladinProgression(u),
        [HeroClass.DeathKnight]: u => new PaladinProgression(u),
    });

    const minionFactory = new MinionFactory();
    const teamManager = new TeamManager(players, {
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
    })

    // new Timer().start(1, false, () => {

    //     let vs = new VoteDialogService();
    //     vs.ShowDialog([MapPlayer.fromIndex(0)], {
    //         buttons: [
    //             { text: "b1", value: 0 },
    //             { text: "b2", value: 1 },
    //             { text: "b3", value: 3 },
    //         ],
    //         timeout: 0,
    //         title: "Choose a button"            
    //     }, result => {
    //         print("Dialog Result:", result)
    //     });
        
    // });

    const gameStateManager = new GameStateManager({
        "balance1": { text: 'Balance 1', hotkey: 1 },
        "balance2": { text: 'Balance 2', hotkey: 2 },
    }, {
        "map1": {
            teamStartingPosition: { 0: Coords.fromWc3Unit(gg_unit_h01L_0017) , 1: Coords.fromWc3Unit(gg_unit_h01L_0018) },
            teamCamera: { 0: CameraSetup.fromHandle(gg_cam_GameCameraH1), 1: CameraSetup.fromHandle(gg_cam_GameCameraH2) },
        },
        "map2": {
            teamStartingPosition: { 0: Coords.fromWc3Unit(gg_unit_h01L_0017) , 1: Coords.fromWc3Unit(gg_unit_h01L_0018) },
            teamCamera: { 0: CameraSetup.fromHandle(gg_cam_GameCameraH1), 1: CameraSetup.fromHandle(gg_cam_GameCameraH2) },
        },
    },
        heroManager,
        minionFactory,
        teamManager);

    // Test
    {
        let orbVm: OrbViewModel[] = [];
        for (let orbView of orbsView.orbs) {
            orbVm.push(new OrbViewModel(config.orbViewModelConfig, MapPlayer.fromIndex(0), orbView));
        }
        
        let rbVm = new ResourceBarViewModel(MapPlayer.fromIndex(0), orbsView, i =>
            new OrbViewModel(config.orbViewModelConfig, MapPlayer.fromIndex(0), orbsView.orbs[i]));
    
        let redResourceBar = rbVm.resourceBar = resourceBarManager.Get(0);
    
        let orb = redResourceBar.AddOrb(OrbType.Blue);
        redResourceBar.AddOrb(OrbType.Purple);
        redResourceBar.AddOrb(OrbType.White);
        
        new Timer().start(7, true, () => {
            redResourceBar.Consume([OrbType.Blue, OrbType.Red])
        });
    
        let x = true;
        new Timer().start(4, true, () => {
            if (x) redResourceBar.AddOrb(OrbType.Summoning);
            // else redResourceBar.AddOrb(<OrbType>(math.floor(math.random(0, 4))));
            else redResourceBar.AddOrb(<OrbType>(math.floor(math.random(0, 1) + 0.5)*2));
            x = !x;
        });
    }
}