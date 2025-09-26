
'use client';
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ListItem } from "@/components/ui/list";
import { MapPin, PlusCircle, Edit, Trash2, Loader2, Download } from "lucide-react";
import { MapLoader } from "@/components/geofencing/map-loader";
import { useTranslation } from "@/hooks/use-translation";
import { getGeofenceData } from "@/ai/flows/get-geofence-data";

const fences = [
    {
        id: 'field-a',
        name: 'North Field (Field A)',
        area: '12.5 Acres',
        crop: 'Wheat',
    },
    {
        id: 'field-b',
        name: 'South-East Orchard (Field B)',
        area: '8.2 Acres',
        crop: 'Grapes',
    },
    {
        id: 'reservoir',
        name: 'Reservoir Area',
        area: '2.1 Acres',
        crop: 'N/A',
    },
];

type GeofenceData = {
    lulcData: string;
    soilData: string;
} | null;

export default function GeofencingPage() {
    const { t } = useTranslation();
    const [loadingLulc, setLoadingLulc] = useState(false);
    const [loadingSoil, setLoadingSoil] = useState(false);
    const [geofenceData, setGeofenceData] = useState<GeofenceData>(null);
    const [polygonArea, setPolygonArea] = useState<number | null>(null);

    const handleFirstVertex = useCallback(async (areaIdentifier: string) => {
        setLoadingSoil(true);
        setGeofenceData(prev => ({ ...(prev || { lulcData: '', soilData: '' }), soilData: '' }));
         try {
            const data = await getGeofenceData({ areaIdentifier });
            setGeofenceData(prev => ({...(prev || { lulcData: '' }), soilData: data.soilData }));
        } catch (error) {
            console.error("Failed to fetch soil data:", error);
            setGeofenceData(prev => ({...(prev || { lulcData: '' }), soilData: 'Failed to load data.' }));
        } finally {
            setLoadingSoil(false);
        }
    }, []);

    const handleAreaSelect = useCallback(async (areaIdentifier: string, area: number) => {
        setLoadingLulc(true);
        setPolygonArea(area);
        setGeofenceData(prev => ({ ...(prev || { lulcData: '', soilData: '' }), lulcData: '' }));

        try {
            const data = await getGeofenceData({ areaIdentifier });
            setGeofenceData(prev => ({...(prev || { soilData: '' }), lulcData: data.lulcData }));
        } catch (error) {
            console.error("Failed to fetch LULC data:", error);
            setGeofenceData(prev => ({...(prev || { soilData: '' }), lulcData: 'Failed to load data.' }));
        } finally {
            setLoadingLulc(false);
        }
    }, []);

    const handleClear = useCallback(() => {
        setGeofenceData(null);
        setPolygonArea(null);
    }, []);

    const handleDownload = () => {
        if (!geofenceData) return;

        const dataToDownload = {
            selectedAreaAcres: polygonArea,
            ...geofenceData,
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToDownload, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "geofence_report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t('geofencing.title')}</h1>
                    <p className="text-muted-foreground">
                        {t('geofencing.description')}
                    </p>
                </div>
                <Button>
                    <PlusCircle />
                    <span>{t('geofencing.createFence')}</span>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('geofencing.mapTitle')}</CardTitle>
                    <CardDescription>{t('geofencing.mapDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full h-[500px] bg-muted rounded-md flex items-center justify-center">
                        <MapLoader onAreaSelect={handleAreaSelect} onFirstVertex={handleFirstVertex} onClear={handleClear} />
                         {polygonArea !== null && (
                            <div className="absolute bottom-4 right-4 bg-background/80 p-2 rounded-md shadow-lg text-sm">
                                <p><strong>Selected Area:</strong> {polygonArea.toFixed(2)} acres</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('geofencing.lulcTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loadingLulc && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading LULC data...</span>
                            </div>
                         )}
                         {geofenceData?.lulcData && <p>{geofenceData.lulcData}</p>}
                         {!loadingLulc && !geofenceData?.lulcData && (
                            <p className="text-muted-foreground">{t('geofencing.lulcDescription')}</p>
                         )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('geofencing.soilTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingSoil && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading Soil data...</span>
                            </div>
                         )}
                         {geofenceData?.soilData && <p>{geofenceData.soilData}</p>}
                         {!loadingSoil && !geofenceData?.soilData && (
                             <p className="text-muted-foreground">{t('geofencing.soilDescription')}</p>
                         )}
                    </CardContent>
                </Card>
            </div>
             {geofenceData && (geofenceData.lulcData || geofenceData.soilData) && (
                <div className="text-center">
                    <Button onClick={handleDownload} size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('geofencing.definedFences')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <List>
                        {fences.map(fence => (
                            <ListItem key={fence.id}>
                                <div className="flex items-center gap-4">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{fence.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {fence.area} - {t('geofencing.currentCrop')}: {fence.crop}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon">
                                        <Edit className="w-4 h-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                         <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </div>
    );
}
