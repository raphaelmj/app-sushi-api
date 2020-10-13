import { Console, Command, createSpinner } from 'nestjs-console';
import { map } from 'p-iteration';
import * as fs from 'fs';
import { DescOptions } from 'src/entities/DescOptions';
import { ReverseOptions } from 'src/entities/ReverseOptions';

@Console()
export class OptionsCommandsService {
  @Command({
    command: 'create-options',
  })
  async createUsers(): Promise<void> {
    const spin = createSpinner();
    spin.start('creating options');

    await this.createDescOptions();
    await this.createReverseOptions();

    spin.succeed('created');
  }

  async createDescOptions() {
    var d = fs.readFileSync(process.cwd() + '/jsons/desc-options.json');
    var opts: any[] = JSON.parse(d.toString());
    await map(opts, async (op: {}, i) => {
      op['ordering'] = i;
      await DescOptions.create(op).save();
    });
  }

  async createReverseOptions() {
    var d = fs.readFileSync(process.cwd() + '/jsons/reverse-options.json');
    var opts: any[] = JSON.parse(d.toString());
    await map(opts, async (op: {}, i) => {
      op['ordering'] = i;
      await ReverseOptions.create(op).save();
    });
  }
}
