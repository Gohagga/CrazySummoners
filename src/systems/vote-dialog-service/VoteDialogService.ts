import { Dialog, DialogButton, MapPlayer, Trigger } from "w3ts"

export type VoteDialog = VoteDialogInfo<any> & {
    dialog: Dialog,
    buttons: VoteDialogButton[],
    players: MapPlayer[],
    votes: number[],
    voteCount: number,
    onResult: (result: any) => void,
}

export type VoteDialogButton = VoteDialogButtonInfo<any> & {
    button: DialogButton,
    trigger: Trigger,
}

export type VoteDialogInfo<TValue> = {
    title: string,
    buttons: VoteDialogButtonInfo<TValue>[],
    timeout: number | null,
}

export type VoteDialogButtonInfo<TValue> = {
    text: string,
    value: TValue,
}

export class VoteDialogService {

    public ShowDialog<TValue>(toPlayers: MapPlayer[], voteDialogInfo: VoteDialogInfo<TValue>, onResult: (result: TValue) => void) {
        let dialog = new Dialog();
        dialog.setMessage(voteDialogInfo.title);
        let buttons: VoteDialogButton[] = [];

        const voteDialog: VoteDialog = {
            title: voteDialogInfo.title,
            timeout: voteDialogInfo.timeout,
            buttons: buttons,
            dialog: dialog,
            players: toPlayers,
            votes: [],
            voteCount: 0,
            onResult: result => onResult(result),
        }

        for (let i = 0; i < voteDialogInfo.buttons.length; i++) {
            let b = voteDialogInfo.buttons[i];

            let button = new DialogButton(dialog, b.text, undefined, false, false);
            let voteButton = <VoteDialogButton>b;

            let buttonId = i;
            let trigger = new Trigger();
            trigger.registerDialogButtonEvent(button);            
            trigger.addAction(() => this.AddVote(voteDialog, buttonId));

            voteButton.button = button;
            voteButton.trigger = trigger;
            buttons.push(voteButton);

            voteDialog.votes.push(0);
        }

        for (let p of toPlayers) {
            dialog.display(p, true);
        }
    }

    private AddVote(voteDialog: VoteDialog, voteId: number) {
        voteDialog.votes[voteId]++;
        voteDialog.voteCount++;

        // Check if votes are all done
        if (voteDialog.voteCount == voteDialog.players.length) {
            this.ResolveDialog(voteDialog);
        }
    }

    private ResolveDialog(voteDialog: VoteDialog) {
        
        let highestIndex = 0;
        let highestVotes = 0;
        for (let i = 0; i < voteDialog.votes.length; i++) {
            if (voteDialog.votes[i] > highestVotes) {
                highestVotes = voteDialog.votes[i];
                highestIndex = i;
            }
        }

        let result = voteDialog.buttons[highestIndex].value;
        voteDialog.onResult(result);

        for (let p of voteDialog.players) {
            voteDialog.dialog.display(p, false);
        }
        for (let b of voteDialog.buttons) {
            b.trigger.destroy();
        }
        voteDialog.dialog.destroy();
    }
}