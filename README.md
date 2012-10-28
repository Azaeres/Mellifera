Mellifera Project README
========================

To do:
------
* User login


Early prototype:
----------------

		/******************************************************
		2011/9/29: Records a contribution event.
			Generates a given amount of credit, backed by debt, in a given member's account.
			Leaves a balance of credit and debt in the system.
			
			Checks for the liability limit before applying.
			The production-ready version should also check for the rate limit before applying.
		*/
		function contribute(memberId, amount)
		{
			var availableDebt = gLiabilityLimit - gDebt[memberId];
			var remaining = availableDebt - amount;

			if (remaining < 0)
			{
				remaining = Math.abs(remaining);
				amount -= remaining;
			}

			gCredit[memberId] += amount;
			gDebt[memberId] += amount;
		}

		/******************************************************
		2011/9/29: Takes credit from the buyer's account, and applies it to the seller's shared debt.
			If there isn't enough credit in the buyer's account, the payment is aborted.
		*/
		function payment(buyerMemberId, sellerMemberId, amount)
		{
			var success = false;
			
			// This makes sure there's enough credit for the payment.
			if (gCredit[buyerMemberId] >= amount)
			{
				// If there's enough buyer's credit to afford the payment, 
				//	we deduct the amount of the payment from their credit.
				gCredit[buyerMemberId] -= amount;
				
				// Now we deduct the amount of the payment from the seller's debt.
				var excessCredit = applyCreditToDebt(sellerMemberId, amount);
				if (excessCredit != 0)
				{
					gCommunityFund += excessCredit;
					
					// Now that we have some new shared credit, it should immediately be distributed.
					distributeDividends();
				}
				
				success = true;
			}
			
			return success;
		}

		/******************************************************
		2011/10/17: Applies a credit to a member's debt.
			Returns any excess credit.
		*/
		function applyCreditToDebt(memberId, amount)
		{
			// First applies the dividend to the member's debt.
			var excessCredit = 0;
			var newDebt = gDebt[memberId] - amount;
			if (newDebt < 0)
			{
				// If there is any part of the dividend remaining, then the debt has been nullified,
				//	and the remainder can be applied to the member's credit.
				gDebt[memberId] = 0;
				excessCredit = Math.abs(newDebt);
			}
			else
			{
				// Here, there's more member's debt than credit in the dividend payment.
				gDebt[memberId] = newDebt;
			}
			
			return excessCredit;
		}

		/******************************************************
		2011/9/29: Evenly distributes all credit in the Community Fund to each member.
		*/
		function distributeDividends()
		{
			var remainder = gCommunityFund % gMemberCount;
			var divisibleFund = gCommunityFund - remainder;

			gCommunityFund = remainder;
			var dividendAmount = divisibleFund / gMemberCount;

			for(var i = 0; i < gMemberCount; i++)
			{
				// Pays dividend for this member.
				var excessCredit = applyCreditToDebt(i, dividendAmount);
				gCredit[i] += excessCredit;
			}
		}

		/******************************************************
		2011/9/29: Throws an error if the money supply is out of balance.
			There should be an equal amount of credit and debt in the system at any given time.
		*/
		function checkForValidMoneySupply()
		{
			// Add up the total amount of credit in the system.
			var totalCredit = gCommunityFund;
			var totalDebt = 0;
			for(var i = 0; i < gMemberCount; i++)
			{
				totalCredit += gCredit[i];
				totalDebt += gDebt[i];
			}

			var diff = Math.abs(totalCredit - totalDebt);
			
			var details = {};
			details.success = false;
			details.totalCredit = totalCredit;
			details.totalDebt = totalDebt;
			details.diff = diff;

			if (diff == 0)
				details.success = true;
				
			return details;
		}

		function isInteger(amount)
		{
			if (amount === parseInt(amount, 10))
				return true;
			
			return false;
		}

		function roundCurrency(hours)
		{
			return (Math.round(hours * 100) / 100).toFixed(2);
		}

		function hoursFromCents(amount)
		{
			var hours = amount / 100;
			
			return roundCurrency(hours);
		}

		function centsFromHours(hours)
		{
			hours = roundCurrency(hours);
			var amount = hours * 100;
			
			return Math.round(amount);
		}
