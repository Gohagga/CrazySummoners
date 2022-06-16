import { MapPlayer } from "w3ts";

export type Team = {
    id: number,
    teamOwner: MapPlayer,
    teamMembers: MapPlayer[]
}

export class TeamManager {
    
    private _playerTeam: Record<number, number>;
    private _teams: Record<number, Team>;
    private _teamList: Team[];
    private _players: MapPlayer[];

    constructor(
        players: MapPlayer[],
        teams: Record<number, Team>
    ) {
        this._playerTeam = {};
        this._teamList = [];
        for (let t of Object.keys(teams)) {
            let teamNumber = Number(t);
            let team = teams[teamNumber];
            for (let member of team.teamMembers) {
                this._playerTeam[member.id] = teamNumber;
            }

            this._teamList.push(team);
        }

        this._players = players;
        this._teams = teams;
    }

    public GetPlayerTeam(player: MapPlayer) {
        return this._teams[this._playerTeam[player.id]];
    }

    public get players() {
        return this._players;
    }

    public get team() {
        return this._teams;
    }

    public get teams() {
        return this._teamList;
    }
}