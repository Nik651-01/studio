
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TriangleAlert, CloudDrizzle, Thermometer, Wind, Droplets, MapPin, Loader2, WifiOff } from "lucide-react";
import Link from "next/link";
import { reasonAboutWeatherAlertRelevance } from "@/ai/flows/reason-weather-alert-relevance";
import { useLocationStore } from '@/lib/location-store';
import { getWeatherForecast, WeatherForecast } from '@/ai/flows/get-weather-forecast';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

// This is now a client component, but we can still fetch data on the server
// for initial render if needed, or fetch on client. For simplicity, we'll keep this as a placeholder.
// In a real app, this would be a server component that fetches and passes data to a client component.
async function WeatherAlert() {
    const { t } = useTranslation();
    const relevance = await reasonAboutWeatherAlertRelevance({
        weatherData: "Alert: Heavy rainfall (80mm) expected in the next 24 hours in your area.",
        cropInformation: "Currently growing Grapes, post-harvest stage.",
        locationData: "User's current location"
    });

    return (
        <Alert className="bg-accent/20 border-accent/50 text-accent-foreground">
            <TriangleAlert className="h-4 w-4 text-accent-foreground" />
            <AlertTitle className="font-bold">{t('dashboard.weatherAlert.title')}</AlertTitle>
            <AlertDescription>
                <p className="mb-2">{t('dashboard.weatherAlert.description')}</p>
                {relevance.isRelevant && (
                    <div className="mt-2 p-3 bg-background/50 rounded-md border">
                        <p className="font-semibold text-sm text-foreground">{t('dashboard.weatherAlert.reasonTitle')}</p>
                        <p className="text-sm">{relevance.reasoning}</p>
                    </div>
                )}
            </AlertDescription>
        </Alert>
    )
}

function LocationPrompt() {
    const { location, loading, error, requestLocation } = useLocationStore();
    const { t } = useTranslation();

    if (location || loading) return null;

    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle>{t('dashboard.locationPrompt.title')}</CardTitle>
                <CardDescription>{t('dashboard.locationPrompt.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={requestLocation}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {t('dashboard.locationPrompt.button')}
                </Button>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </CardContent>
        </Card>
    );
}

function WeatherDisplay() {
    const { location, address, weather, setWeather } = useLocationStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchWeather() {
            if (location) {
                setLoading(true);
                setError(null);
                try {
                    const forecast = await getWeatherForecast({ 
                        latitude: location.latitude, 
                        longitude: location.longitude 
                    });
                    setWeather(forecast);
                } catch (e) {
                    setError(t('dashboard.weather.error'));
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        fetchWeather();
    }, [location, setWeather, t]);

    const isStale = !!error && !!weather;

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t('dashboard.weather.title')}</CardTitle>
                        <CardDescription>
                            {address?.description || t('dashboard.weather.title')}
                            {!location && !loading && ` ${t('dashboard.weather.locationNotAvailable')}`}
                        </CardDescription>
                    </div>
                    {isStale && weather?.fetchedAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted rounded-md">
                            <WifiOff className="w-4 h-4" />
                            <span>{t('dashboard.weather.offline')} {formatDistanceToNow(new Date(weather.fetchedAt), { addSuffix: true })}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">{t('dashboard.weather.loading')}</p>
                    </div>
                )}
                {error && !weather && <p className="text-destructive h-24 flex items-center">{error} {t('dashboard.weather.checkConnection')}</p>}
                {weather && (
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <CloudDrizzle className="w-16 h-16 text-primary" />
                            <div>
                                <p className="text-5xl font-bold">{weather.currentTemp}°C</p>
                                <p className="text-muted-foreground">{weather.description}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="flex items-center gap-2 justify-end">
                                <p className="text-sm">{weather.tempHigh}° / {weather.tempLow}°</p>
                                <Thermometer className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <p className="text-sm">{t('dashboard.weather.humidity')} {weather.humidity}%</p>
                                <Droplets className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <p className="text-sm">{t('dashboard.weather.wind')} {weather.windSpeed} km/h</p>
                                <Wind className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                )}
                 {!location && !loading && !weather && (
                    <p className="text-muted-foreground h-24 flex items-center">{t('dashboard.weather.shareLocationPrompt')}</p>
                 )}
            </CardContent>
        </Card>
    );
}


export default function DashboardPage() {
    const { location } = useLocationStore();
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('dashboard.title')}</h1>
                <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
            </div>

            <LocationPrompt />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <WeatherDisplay />
                
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.soilHealth.title')}</CardTitle>
                        <CardDescription>{t('dashboard.soilHealth.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex justify-between"><span>{t('dashboard.soilHealth.nitrogen')}</span> <span className="font-semibold text-green-600">{t('dashboard.soilHealth.optimal')}</span></li>
                            <li className="flex justify-between"><span>{t('dashboard.soilHealth.phosphorus')}</span> <span className="font-semibold text-orange-500">{t('dashboard.soilHealth.slightlyLow')}</span></li>
                            <li className="flex justify-between"><span>{t('dashboard.soilHealth.potassium')}</span> <span className="font-semibold text-green-600">{t('dashboard.soilHealth.optimal')}</span></li>
                            <li className="flex justify-between"><span>{t('dashboard.soilHealth.phLevel')}</span> <span className="font-semibold">6.8</span></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {location && <WeatherAlert />}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.cropRecommendations.title')}</CardTitle>
                        <CardDescription>{t('dashboard.cropRecommendations.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                           <Link href="/recommendations">{t('dashboard.cropRecommendations.button')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.advisoryServices.title')}</CardTitle>
                        <CardDescription>{t('dashboard.advisoryServices.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/advisories">{t('dashboard.advisoryServices.button')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
