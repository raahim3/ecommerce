<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function getCountries(): JsonResponse
    {
        $countries = Country::orderBy('name')->get(['id', 'name', 'iso2', 'phonecode', 'emoji']);
        return response()->json($countries);
    }

    public function getStates(string $country): JsonResponse
    {
        $countryModel = Country::where('name', $country)
            ->orWhere('id', $country)
            ->orWhere('iso2', $country)
            ->orWhere('iso3', $country)
            ->first();

        if (!$countryModel) {
            return response()->json([]);
        }

        $states = State::where('country_id', $countryModel->id)
            ->orWhere('country_code', $countryModel->iso2)
            ->orderBy('name')
            ->get(['id', 'name', 'country_id', 'country_code']);

        return response()->json($states);
    }

    public function getCities(Request $request, string $state): JsonResponse
    {
        $stateQuery = State::query();

        if (is_numeric($state)) {
            $stateQuery->where('id', (int) $state);
        } else {
            $stateQuery->where('name', $state);
            if ($request->filled('country')) {
                $country = $request->query('country');
                $stateQuery->whereHas('country', function ($q) use ($country) {
                    $q->where('name', $country)->orWhere('id', $country)->orWhere('iso2', $country);
                });
            }
        }

        $stateModel = $stateQuery->first();

        if (!$stateModel) {
            return response()->json([]);
        }

        $cities = City::where('state_id', $stateModel->id)
            ->orderBy('name')
            ->get(['id', 'name', 'state_id']);

        return response()->json($cities);
    }
}
