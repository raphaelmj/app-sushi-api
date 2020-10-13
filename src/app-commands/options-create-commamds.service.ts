import { MenuElementType } from './../interfaces/site-element.interface';
import { MenuCategory } from './../entities/MenuCategory';
import { CartCategory } from './../entities/CartCategory';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { createSpinner, Console, Command } from 'nestjs-console';
import { Repository } from 'typeorm';
import { MenuElement } from 'src/entities/MenuElement';
import { map } from 'p-iteration';

@Console()
export class OptionsCreateCommamdsService {

    constructor(
        @InjectRepository(CartCategory)
        private readonly cartCategoryRepository: Repository<CartCategory>,
        @InjectRepository(MenuCategory)
        private readonly menuCategoryRepository: Repository<MenuCategory>,
        @InjectRepository(MenuElement)
        private readonly menuElementRepository: Repository<MenuElement>
    ) {

    }

    @Command({
        command: 'create-options-strings',
    })
    async createUsers(): Promise<void> {
        const spin = createSpinner();
        spin.start('creating options strings');

        await this.createOptions()

        spin.succeed('created');
    }



    async createOptions() {

        var elements: MenuElement[] = await this.menuElementRepository.find()


        await map(elements, async (el, i) => {

            console.log(el.options)

            switch (el.elementType) {
                case MenuElementType.oneName:

                    break

                case MenuElementType.manyNames:

                    el.priceNames.map((p, i) => {
                        el.priceNames[i].options = []
                    })

                    await el.save()

                    break

                case MenuElementType.descElements:

                    el.descElements.map((p, i) => {
                        el.descElements[i].options = el.options
                    })

                    await el.save()

                    break

                case MenuElementType.configPrice:

                    break
            }
        })

    }


}
