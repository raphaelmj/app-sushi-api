import { Injectable } from '@nestjs/common';

@Injectable()
export class EsPainlessScriptsService {
    bonusPercentSum(): string {
        const code = [];
        code.push("double percent = doc.currentBonusPercent.value;");
        code.push("double total = doc.total.value;");
        code.push("double bonusPrice = doc.total.value * (percent/100);");
        code.push("return bonusPrice;");
        var source = code.join(" ");
        return source
    }

    bonusCartSum(): string {
        return "doc.total.value - doc.bonusTotal.value;"
    }

    extraPriceSum(): string {
        const code = [];
        code.push("double extra = doc.extra.value;");
        code.push("double oneExtraPrice = doc.oneExtraPrice.value;");
        code.push("double t = extra * oneExtraPrice;");
        code.push("return t;");
        var source = code.join(" ");
        return source
    }
}
